import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import React, { Fragment, useState } from "react";
import { useGoogleCalendarStore } from "../../store/googleCalendarStore";
import { useEffect } from "react";
import {
  getGoogleEvents,
  updateGoogleCredentials,
} from "../../API/googleCalendarAPI";

export default function GoogleCalendarAddEventBtn({ addEvent }) {
  const { googleEvents, setGoogleEvents } = useGoogleCalendarStore();
  const [isError, setIsError] = useState(false);

  const loadGoogleEvents = async (gToken: string) => {
    try {
      const data = await getGoogleEvents(gToken);

      // detect expired token
      if (data?.error && data?.error?.code === 401) {
        const refreshToken = localStorage.getItem("googleRefreshToken");
        const updatedCredentials = await updateGoogleCredentials(refreshToken);
        const newAccessToken = updatedCredentials?.access_token;
        localStorage.setItem("googleAccessToken", newAccessToken);
        loadGoogleEvents(newAccessToken);
        return;
      }

      setGoogleEvents(data?.items);
    } catch (error) {
      setIsError(true);
      console.error(error);
    }
  };

  useEffect(() => {
    const googleAccessToken = localStorage.getItem("googleAccessToken");

    if (googleAccessToken) {
      loadGoogleEvents(googleAccessToken);
    }
  }, []);

  const generateMenuEvents = () => {
    if (googleEvents?.length === 0 && !isError) {
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

    if (googleEvents?.length > 0 && !isError) {
      return googleEvents.map((event) => {
        const { start, end, id, summary } = event;
        const from: { date: string; time: string } = setDateTimeObj(
          start.dateTime
        );
        const to: { date: string; time: string } = setDateTimeObj(end.dateTime);
        event.from = from;
        event.to = to;

        return (
          <div className="" key={id}>
            <Menu.Item>
              {({ active }) => (
                <button
                  type="button"
                  className={`${
                    active ? "bg-blue-300 text-white" : "text-gray-900"
                  } 
                        group w-full p-2 text-sm`}
                  onClick={() => {
                    addEvent(event);
                  }}
                >
                  {summary ? summary : "No title"}
                  <span
                    className={`${
                      active ? "text-white" : "text-gray-500"
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
    const activeEvent = googleEvents.find((event) => {
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

    const prevEvents: any[] = googleEvents.filter((event) => {
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
          <div className="inline-flex w-full justify-center rounded-md bg-blue-600 hover:bg-blue-700">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white border-r-2"
              onClick={addActiveEvent}
            >
              Add active event
            </button>
            <Menu.Button className="p-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
              <ChevronDownIcon
                className="h-5 w-5 text-white hover:text-violet-100"
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
            <Menu.Items className="absolute bottom-10 right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden focus:outline-none">
              {generateMenuEvents()}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}
