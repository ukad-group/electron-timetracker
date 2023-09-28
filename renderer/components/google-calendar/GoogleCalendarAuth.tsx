import React, { useEffect, useState } from "react";
import ApiCalendar from "react-google-calendar-api";
import Button from "../ui/Button";
import { useGoogleCalendarStore } from "../../store/googleCalendarStore";

const config = {
  clientId:
    "717524073110-hbh5ei25iuhb7mvucqgjr92maivpt7df.apps.googleusercontent.com",
  apiKey: "AIzaSyC8SpmdGCMoNOkJM3fc85PAyMiFbxOOUAM",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

const { handleAuthClick, handleSignoutClick, listEvents, sign } =
  new ApiCalendar(config);

function GoogleCalendarAuth() {
  const [signed, setSigned] = useState(false);
  const { googleEvents, setGoogleEvents } = useGoogleCalendarStore();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    const isSign = sign;
    setSigned(isSign);
    if (isSign) {
      getEvents();
    }
  }, []);

  const signInHandler = () => {
    handleAuthClick().then(() => {
      setSigned(true);
      getEvents();
    });
  };

  // const signInHandler = () => {
  //   signIn().then((data) => {
  //     setSigned(true);
  //     getEvents();
  //   });
  // };

  const signOutHandler = () => {
    setSigned(false);
    handleSignoutClick();
  };

  const getEventsList = () => {
    return listEvents({
      showDeleted: false,
      orderBy: "updated",
    }).then(({ result }) => {
      return result?.items;
    });
  };

  const getEvents = () => {
    getEventsList().then((items) => {
      setGoogleEvents(items);
    });
  };

  const buildEventsList = () => {
    return googleEvents.map((event) => {
      const { id, start, end, summary, htmlLink } = event;
      const from = setDateTimeObj(start.dateTime);
      const to = setDateTimeObj(end.dateTime);
      const month = parseInt(from.date.split(".")[1]);

      if (currentMonth === month) {
        return (
          <li
            id={id}
            key={id}
            className="text-m font-medium text-gray-900 px-4 py-2 flex justify-between border items-stretch"
          >
            <div className="w-full justify-start">
              {summary}
              <span className="block text-sm text-gray-500">
                {from.date} {from.time} - {to.time}
              </span>
            </div>
            <a
              href={htmlLink}
              target="_blank"
              className="flex w-full justify-end align-middle text-sm text-gray-500 pl-10"
            >
              Go to event
            </a>
          </li>
        );
      }
    });
  };

  const setDateTimeObj = (date) => {
    return {
      date: new Date(date).toLocaleDateString(),
      time: new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div>
      {signed ? (
        <>
          <Button text="Signout" callback={signOutHandler} type="button" />
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold py-4">
              Current month google events
            </h3>
          </div>
          <div className="callendar-container">
            <ul className="callendar-list">{buildEventsList()}</ul>
          </div>
        </>
      ) : (
        <Button
          text="Connect to Google Calendar"
          callback={signInHandler}
          type="button"
        />
      )}
    </div>
  );
}

export default GoogleCalendarAuth;
