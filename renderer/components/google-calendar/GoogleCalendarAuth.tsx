import React, { useEffect, useState } from "react";
import { checkIsSignedIn, getEventsList, signIn, signOut } from "../../API/googleCalendraAPI";
import Button from "../ui/Button";

function GoogleCalendarAuth() {
  const [signed, setSigned] = useState(false);
  const [events, setEvents] = useState([]);
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
    signOut();
  }

  const getEvents = () => {
    getEventsList().then((items) => {
      setEvents(items);
    });
  }

  const buildEventsList = () => {
    return events.map((event) => {
      const { id, summary, htmlLink } = event;
      return (
        <li id={id} key={id}  className="text-m font-medium text-gray-900 px-4 py-2 text-sm border">
          {summary}
          <a href={ htmlLink } target="_blank" className="text-sm text-gray-500 pl-10">Go to event</a>
        </li>
      );
    });
  };

  return (
    <div className="p-10">
      {
        signed
          ? <Button text="Sign Out" callback={signOutHandler} />
          : <Button text="Sign In" callback={signInHandler} />
      }
      <div className="callendar-container">
        <ul className="callendar-list">
          { buildEventsList() }
        </ul>
      </div>
    </div>
  );
}

export default GoogleCalendarAuth;