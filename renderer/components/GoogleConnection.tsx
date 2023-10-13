import React from "react";
import { useGoogleCalendarStore } from "../store/googleCalendarStore";
import { CheckIcon } from "@heroicons/react/24/solid";
import GoogleCalendarAuth from "./google-calendar/GoogleCalendarAuth";

const GoogleConnection = () => {
  const { isLogged, googleUsername } = useGoogleCalendarStore();

  return (
    <div className="p-4 flex items-start justify-between gap-6 border rounded-lg shadow">
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
  );
};

export default GoogleConnection;
