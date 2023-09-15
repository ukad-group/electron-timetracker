import React, { useEffect, useState } from "react";
import { checkIsSignedIn, getEventsList, signIn, signOut } from "../../API/googleCalendarAPI";
import Button from "../ui/Button";
import useCalendarsContext from "../../hooks/useCalendarsContext";

function GoogleCalendarAuth() {
  const [signed, setSigned] = useState(false);
  const [events, setEvents] = useState([]);
  const { setGoogleCalendarEvents } = useCalendarsContext();

  useEffect(() => {
    const sign = checkIsSignedIn();
    setSigned(sign);
    if (sign) {
      getEvents();
    }
  }, []);

  const signInHandler = () => {
    signIn().then((data) => {
      setSigned(true);
      getEvents();
    });
  }

  const signOutHandler = () => {
    setSigned(false);
    signOut();
  }

  const getEvents = () => {
    getEventsList().then((items) => {
      setEvents(items);
      setGoogleCalendarEvents(items);
    });
  }

  const buildEventsList = () => {
    return events.map((event) => {
      const { id, start, end, summary, htmlLink } = event;
      const from = setDateTimeObj(start.dateTime);
      const to = setDateTimeObj(end.dateTime);
      return (
        <li id={id} key={id} className="text-m font-medium text-gray-900 px-4 py-2 flex justify-between border items-stretch">
          <div className="w-full justify-start">
            {summary}
            <span className="block text-sm text-gray-500">{from.date} {from.time} - {to.time}</span>
          </div>
          <a href={ htmlLink } target="_blank" className="flex w-full justify-end align-middle text-sm text-gray-500 pl-10">Go to event</a>
        </li>
      );
    });
  };

  const setDateTimeObj = (date) => {
    return {
      date: new Date(date).toLocaleDateString(),
      time: new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
  }

  return (
    <div>
      {
        signed
          ? (
            <>
              <div className="flex justify-end" onClick={signOutHandler} >
                <div className="text-sm font-medium text-blue-600 p-2 cursor-pointer">SignOut</div>
              </div>
              <div className="callendar-container">
                <ul className="callendar-list">
                  { buildEventsList() }
                </ul>
              </div>
            </>
          )
          : <Button text="Connect to Google Calendar" callback={signInHandler} />
      }
    </div>
  );
}

export default GoogleCalendarAuth;
