import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import { useRouter } from "next/router";
import {
  getGoogleAuthUrl,
  getGoogleCredentials,
  getGoogleUserInfo,
} from "../API/googleCalendarAPI";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

type GoogleCredentails = {
  access_token: string;
  refresh_token: string;
};

export type GoogleUser = {
  googleAccessToken: string;
  googleRefreshToken: string;
  userName: string;
  accountId: string;
};

const GoogleConnection = () => {
  const router = useRouter();
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);
  const [loggedUsers, setLoggedUsers] = useState([]);

  const signInHandler = () => {
    const googleAuthUrl = getGoogleAuthUrl();
    router.push(googleAuthUrl);
  };

  const signOutHandler = (id: string) => {
    const loggedUsersFromLs = JSON.parse(localStorage.getItem("googleUsers"));
    const filteredUsers = loggedUsersFromLs.filter(
      (user: GoogleUser) => user.accountId !== id
    );

    if (filteredUsers.length === 0) {
      setShowGoogleEvents(false);
      localStorage.setItem("showGoogleEvents", "false");
    }

    localStorage.setItem("googleUsers", JSON.stringify(filteredUsers));
    setLoggedUsers(filteredUsers);
    // router.push("/settings");
  };

  const loadGoogleCredentials = async (authorizationCode: string) => {
    try {
      const credentials = await getGoogleCredentials(authorizationCode);
      const googleProfileInfo = await loadGoogleUserInfo(credentials);
      const googleProfileUsername = googleProfileInfo?.names[0]?.displayName;
      const googleProfileId = googleProfileInfo?.resourceName;
      const googleUsersFromLs = JSON.parse(localStorage.getItem("googleUsers"));

      if (
        googleUsersFromLs.some((user) => {
          return user.accountId === googleProfileId;
        })
      ) {
        alert(`Account ${googleProfileUsername} has already logged`);
      } else {
        const userObject: GoogleUser = {
          googleAccessToken: credentials.access_token,
          googleRefreshToken: credentials.refresh_token,
          userName: googleProfileUsername,
          accountId: googleProfileId,
        };

        googleUsersFromLs.push(userObject);
        localStorage.setItem("googleUsers", JSON.stringify(googleUsersFromLs));
        setLoggedUsers(googleUsersFromLs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadGoogleUserInfo = async (gCreds: GoogleCredentails) => {
    try {
      const data = await getGoogleUserInfo(gCreds.access_token);
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckboxChange = () => {
    setShowGoogleEvents((prev) => !prev);
    const reversShowGoogleEvents = !showGoogleEvents;
    localStorage.setItem("showGoogleEvents", reversShowGoogleEvents.toString());
  };

  useEffect(() => {
    const googleUsers = JSON.parse(localStorage.getItem("googleUsers"));
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code"); // detect redirection from auth page

    if (authorizationCode && !googleUsers) {
      localStorage.setItem("googleUsers", JSON.stringify([]));
      loadGoogleCredentials(authorizationCode);
    } else if (authorizationCode) {
      loadGoogleCredentials(authorizationCode);
    }

    if (localStorage.getItem("showGoogleEvents") === "true") {
      setShowGoogleEvents(true);
    }

    const loggedUsersFromLs = JSON.parse(localStorage.getItem("googleUsers"));
    if (loggedUsersFromLs) {
      setLoggedUsers(loggedUsersFromLs);
    }
  }, []);

  return (
    <div className="p-4 flex flex-col items-start justify-between gap-2 border rounded-lg shadow">
      <div className="flex justify-between items-center w-full">
        <span className="font-medium">Google</span>
        {!loggedUsers.length && (
          <Button text="Add account" callback={signInHandler} type="button" />
        )}
        {loggedUsers.length > 0 && (
          <button
            onClick={signInHandler}
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border shadow-sm"
          >
            <span className="hover:underline text-gray-500">
              Add another account
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 w-full">
        {!loggedUsers.length && (
          <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
            No one user authorized
          </div>
        )}

        {loggedUsers.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {loggedUsers.map((user) => (
              <div key={user.accountId} className="flex gap-4 items-center">
                <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-blue-900">
                  {user.userName}
                </div>
                <div
                  onClick={() => signOutHandler(user.accountId)}
                  className="cursor-pointer bg-gray-400 hover:bg-gray-500 transition duration-300 inline-flex gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 fill-white" />
                  Sign Out
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">
        After connection, you will be able to fill in the Report with the
        information from events of your Google Calendar
      </p>
      {loggedUsers?.length > 0 && (
        <div className="flex items-start justify-between gap-6 w-full">
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
