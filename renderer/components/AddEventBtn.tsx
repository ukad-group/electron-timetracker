import React, { Fragment, useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useGoogleCalendarStore } from "../store/googleCalendarStore";
import {
  getGoogleEvents,
  updateGoogleCredentials,
} from "../API/googleCalendarAPI";
import { checkAlreadyAddedGoogleEvents } from "../utils/utils";
import { googleCalendarEventsParsing } from "./google-calendar/GoogleCalendarEventsParsing";
import { Office365User } from "./Office365Connection";
// import { GoogleUser } from "./GoogleConnection";

export type Event = {
  from: {
    date: string;
    time: string;
  };
  to: {
    date: string;
    time: string;
  };
  project?: string;
  activity?: string;
  description?: string;
  calendar?: string;
};
type AddEventBtnProps = {
  addEvent: (event: Event) => void;
  availableProjects: Array<string>;
};
export default function AddEventBtn({
  addEvent,
  availableProjects,
}: AddEventBtnProps) {
  const [office365Events, setOffice365Events] = useState([]);
  const [isError, setIsError] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const { googleEvents, setGoogleEvents } = useGoogleCalendarStore();

  const loadGoogleEvents = async (
    accessToken: string,
    refreshToken: string,
    index: number
  ) => {
    try {
      const data = await getGoogleEvents(accessToken);

      // detect expired token
      if (data?.error && data?.error?.code === 401) {
        const updatedCredentials = await updateGoogleCredentials(refreshToken);
        const newAccessToken = updatedCredentials?.access_token;
        const usersLs = JSON.parse(localStorage.getItem("googleUsers"));
        usersLs[index].googleAccessToken = newAccessToken;
        localStorage.setItem("googleUsers", JSON.stringify(usersLs));
        return "expired-token";
      }

      return data?.items;
    } catch (error) {
      setIsError(true);
      console.error(error);
      return [];
    }
  };

  const loadGoogleEventsFromAllUsers = async (users) => {
    const userPromises = users.map((user, i) =>
      loadGoogleEvents(user.googleAccessToken, user.googleRefreshToken, i)
    );
    const userEvents = await Promise.all(userPromises);

    if (userEvents.includes("expired-token")) {
      const updatedUsersLs = JSON.parse(localStorage.getItem("googleUsers"));
      loadGoogleEventsFromAllUsers(updatedUsersLs);
      return;
    }

    const flattenedEvents = userEvents.flat();

    const checkedGoogleEvents = checkAlreadyAddedGoogleEvents(
      googleEvents,
      flattenedEvents
    ).filter((gEvent) => gEvent?.start?.dateTime && gEvent?.end?.dateTime);

    setGoogleEvents(checkedGoogleEvents);
  };

  const getOffice365EventByUser = async (
    accessToken: string,
    refreshToken: string,
    userId: string
  ) => {
    let res = await global.ipcRenderer.invoke(
      "office365:get-today-events",
      accessToken
    );

    if (res?.error?.code === "MailboxNotEnabledForRESTAPI") {
      return [];
    }

    if (res?.error) {
      const data = await updateAccessToken(refreshToken);

      if (!data?.access_token) {
        removeStoredUser(userId);
        return;
      } else {
        updateStoredUser(userId, data.access_token);

        return await getOffice365EventByUser(
          data.access_token,
          refreshToken,
          userId
        );
      }
    }

    if (res?.value) return res.value;

    return [];
  };

  const removeStoredUser = (userId: string) => {
    const storedUsers =
      JSON.parse(localStorage.getItem("office365-users")) || [];
    const filteredUsers = storedUsers.filter(
      (user: Office365User) => user.userId !== userId
    );

    if (filteredUsers.length > 0) {
      localStorage.setItem("office365-users", JSON.stringify(filteredUsers));
    } else {
      localStorage.removeItem("office365-users");
    }
  };

  const updateStoredUser = (userId: string, newAccessToken: string) => {
    const storedUsers =
      JSON.parse(localStorage.getItem("office365-users")) || [];
    const updatedUsers = storedUsers.map((user: Office365User) => {
      if (user.userId === userId) {
        return { ...user, accessToken: newAccessToken };
      } else {
        return user;
      }
    });

    localStorage.setItem("office365-users", JSON.stringify(updatedUsers));
  };

  const updateAccessToken = async (refreshToken: string) =>
    await global.ipcRenderer.invoke(
      "office365:refresh-access-token",
      refreshToken
    );

  const getOffice365Events = async () => {
    const storedUsers =
      JSON.parse(localStorage.getItem("office365-users")) || [];

    if (!storedUsers.length) return;

    const usersPromises = storedUsers.map((user: Office365User) => {
      const { accessToken, refreshToken, userId } = user;

      return getOffice365EventByUser(accessToken, refreshToken, userId);
    });
    const promisedOffice365Events = await Promise.all(usersPromises);
    const allOffice365Events = promisedOffice365Events.reduce(
      (acc, curr) => (!curr ? acc : [...acc, ...curr]),
      []
    );

    setOffice365Events(allOffice365Events || []);
  };

  useEffect(() => {
    const googleUsers = JSON.parse(localStorage.getItem("googleUsers"));
    if (!googleUsers) return;

    if (googleUsers.length > 0) {
      loadGoogleEventsFromAllUsers(googleUsers);
    } else if (googleUsers.length === 0) {
      setGoogleEvents([]);
    }

    (async () => {
      await getOffice365Events();
    })();
  }, []);

  useEffect(() => {
    combineAndSortEvents();
  }, [googleEvents, office365Events]);

  const prepareGoogleEvents = () => {
    if (googleEvents?.length > 0 && !isError) {
      return googleEvents.map((event) => {
        const { start, end, id, summary } = event;
        const from: { date: string; time: string } = setDateTimeObj(
          start.dateTime
        );
        const to: { date: string; time: string } = setDateTimeObj(end.dateTime);
        event.from = from;
        event.to = to;

        return { start, end, id, summary, from, to };
      });
    }

    return [];
  };

  const prepareOffice365Events = () => {
    if (!office365Events?.length) return [];

    const preparedEvents = office365Events.map((event) => {
      const { start, end, id, subject } = event;
      const from: { date: string; time: string } = setDateTimeObj(
        new Date(`${start.dateTime}Z`).toString()
      );
      const to: { date: string; time: string } = setDateTimeObj(
        new Date(`${end.dateTime}Z`).toString()
      );
      event.from = from;
      event.to = to;

      return { start, end, id, summary: subject, from, to };
    });

    return preparedEvents;
  };

  const combineAndSortEvents = () => {
    const googleEvents = prepareGoogleEvents();
    const office365Events = prepareOffice365Events();
    googleEvents.forEach((event) => {
      event["calendar"] = "google";
    });
    office365Events.forEach((event) => {
      event["calendar"] = "office365";
    });
    const combinedEvents = [...googleEvents, ...office365Events];
    const sortedEvents = combinedEvents.sort((a, b) => {
      const [hoursA, minutesA] = a.from.time.split(":").map(Number);
      const [hoursB, minutesB] = b.from.time.split(":").map(Number);

      if (hoursA !== hoursB) {
        return hoursA - hoursB;
      } else {
        return minutesA - minutesB;
      }
    });

    setAllEvents(sortedEvents);
  };

  const generateMenuEvents = () => {
    if (allEvents?.length === 0 && !isError) {
      return (
        <p className="text-gray-500 text-xs p-2 text-center">
          You don't have events for today
        </p>
      );
    }

    if (isError) {
      return (
        <p className="text-gray-500 text-xs p-2 text-center">
          Something went wrong while getting your events
        </p>
      );
    }

    if (allEvents?.length > 0 && !isError) {
      return allEvents.map((event) => {
        const { from, to, id, summary } = event;

        event = googleCalendarEventsParsing(event, availableProjects);

        return (
          <div className="dark:bg-gray-800" key={id}>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={`${
                    active
                      ? "bg-blue-300 text-white dark:bg-blue-700/60 dark:text-dark-heading"
                      : "text-gray-900 dark:text-dark-main"
                  } group w-full p-2 text-sm`}
                  onClick={() => {
                    addEvent(event);
                    global.ipcRenderer.send(
                      "send-analytics-data",
                      "registrations",
                      {
                        registration: `${event.calendar}-calendar-event_registration`,
                      }
                    );
                    global.ipcRenderer.send(
                      "send-analytics-data",
                      "registrations",
                      {
                        registration: `all_calendar-events_registration`,
                      }
                    );
                  }}
                >
                  {summary ? summary : "No title"}
                  <span
                    className={`${
                      active
                        ? "text-white dark:text-dark-heading"
                        : "text-gray-500 dark:text-dark-main"
                    } block text-xs`}
                  >
                    {from.time} - {to.time}
                  </span>
                </button>
              )}
            </Menu.Item>
          </div>
        );
      });
    }
  };

  const setDateTimeObj = (date: string): { date: string; time: string } => {
    return {
      date: new Date(date).toLocaleDateString(),
      time: new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const getTimeAsInt = (date: string = ""): number => {
    const curDate: Date = date ? new Date(date) : new Date();
    return parseInt(
      curDate.getHours() + "" + ("0" + curDate.getMinutes()).substr(-2)
    );
  };

  const addActiveEvent = () => {
    const activeEvent = allEvents.find((event) => {
      const { start, end } = event;
      const intFrom = getTimeAsInt(start.dateTime);
      const intTo = getTimeAsInt(end.dateTime);
      const intNow = getTimeAsInt();
      return intFrom < intNow && intTo > intNow;
    });

    if (activeEvent) {
      addEvent(activeEvent);
      return;
    }

    const prevEvents: any[] = allEvents.filter((event) => {
      const { end } = event;
      const intTo: number = getTimeAsInt(end.dateTime);
      const intNow: number = getTimeAsInt();
      return intTo < intNow;
    });

    if (prevEvents && prevEvents.length > 0) {
      const sortedEvents = prevEvents.sort((a, b) => {
        return getTimeAsInt(a.end.dateTime) - getTimeAsInt(b.end.dateTime);
      });
      addEvent(sortedEvents.at(-1));
    }
  };

  return (
    <div className="">
      <div className="">
        <Menu as="div" className="relative inline-block text-left">
          <div className="inline-flex w-full justify-center rounded-md bg-blue-700 hover:bg-blue-600 dark:bg-dark-button-back hover:dark:bg-dark-button-hover ">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white border-r-2 dark:text-dark-heading dark:border-indigo-800 "
              onClick={addActiveEvent}
            >
              Add active event
            </button>
            <Menu.Button className="p-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              <ChevronDownIcon
                className="h-5 w-5 text-white hover:text-violet-100 dark:text-dark-heading"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute bottom-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden focus:outline-none dark:divide-gray-500 dark:bg-gray-800 dark:shadow-slate-900">
              {generateMenuEvents()}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
