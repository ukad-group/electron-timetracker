import React, { useEffect, useState } from "react";
import { useGoogleCalendarStore } from "../store/googleCalendarStore";
import { CheckIcon } from "@heroicons/react/24/solid";
import GoogleCalendarAuth from "./google-calendar/GoogleCalendarAuth";

const GoogleConnection = () => {
  const { isLogged, googleUsername, googleEvents, setGoogleEvents } =
    useGoogleCalendarStore();
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);

  const handleCheckboxChange = () => {
    setShowGoogleEvents((prev) => !prev);
    const reversShowGoogleEvents = !showGoogleEvents;
    localStorage.setItem("showGoogleEvents", reversShowGoogleEvents.toString());
  };

  useEffect(() => {
    const storedShowGoogleEvents = localStorage.getItem("showGoogleEvents");
    if (storedShowGoogleEvents === "true") {
      setShowGoogleEvents(true);
    }
  }, []);

  return (
    <div className="p-4 flex flex-col items-start justify-between gap-6 border rounded-lg shadow">
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <span className="font-medium">Google</span>
            {isLogged && (
              <div className="text-green-700 inline-flex gap-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200">
                Already authorized
                <CheckIcon className="w-4 h-4 fill-green-700" />
              </div>
            )}

            {isLogged && googleUsername?.length > 0 && (
              <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-white">
                {googleUsername}
              </div>
            )}
            {!isLogged && (
              <div className="text-yellow-600 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
                Not authorized
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            After connection, you will be able to fill in the Report with the
            information from events of your Google Calendar
          </p>
        </div>
        <GoogleCalendarAuth />
      </div>
      {isLogged && (
        <div className="flex items-start justify-between gap-6">
          <p className=" max-w-sm text-sm text-gray-500">
            Show google events in activity table
          </p>
          <div>
            <input
              onChange={handleCheckboxChange}
              className="w-4 h-4"
              type="checkbox"
              checked={showGoogleEvents}
            ></input>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleConnection;
