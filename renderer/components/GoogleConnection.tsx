import React, { useEffect, useState } from "react";
import { useGoogleCalendarStore } from "../store/googleCalendarStore";
import UserStatusPanel from "./google-calendar/UserStatusPanel";
import Button from "./ui/Button";
import { useRouter } from "next/router";
import {
  getGoogleAuthUrl,
  getGoogleCredentials,
  getGoogleUsername,
  updateGoogleCredentials,
} from "../API/googleCalendarAPI";

type GoogleCredentails = {
  access_token: string;
  refresh_token: string;
};

export type GoogleUser = {
  googleAccessToken: string;
  googleRefreshToken: string;
  userName: string;
};

const GoogleConnection = () => {
  const router = useRouter();
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);
  const [loggedUsers, setLoggedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const signInHandler = () => {
    const googleAuthUrl = getGoogleAuthUrl();
    router.push(googleAuthUrl);
  };

  const signOutHandler = (name: string) => {
    const loggedUsersFromLs = JSON.parse(localStorage.getItem("googleUsers"));
    const filteredUsers = loggedUsersFromLs.filter(
      (user) => user.userName !== name
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
      setLoading(true);

      const credentials = await getGoogleCredentials(authorizationCode);
      const googleProfileUsername = await loadGoogleUsername(credentials);
      const googleUsersFromLs = JSON.parse(localStorage.getItem("googleUsers"));

      if (
        googleUsersFromLs.some((user) => {
          return user.userName === googleProfileUsername;
        })
      ) {
        alert(`Account ${googleProfileUsername} has already logged`);
      } else {
        const userObject: GoogleUser = {
          googleAccessToken: credentials.access_token,
          googleRefreshToken: credentials.refresh_token,
          userName: googleProfileUsername,
        };

        googleUsersFromLs.push(userObject);
        localStorage.setItem("googleUsers", JSON.stringify(googleUsersFromLs));
        setLoggedUsers(googleUsersFromLs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleUsername = async (gCreds: GoogleCredentails) => {
    try {
      const data = await getGoogleUsername(gCreds.access_token);

      // // detect expired token
      // if (data?.error && data?.error?.code === 401) {
      //   const refreshToken = localStorage.getItem("googleRefreshToken");
      //   const updatedCredentials = await updateGoogleCredentials(refreshToken);
      //   const newAccessToken = updatedCredentials?.access_token;
      //   localStorage.setItem("googleAccessToken", newAccessToken);
      //   loadGoogleUsername(newAccessToken);
      //   return;
      // }

      return data?.names[0]?.displayName;
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
    <div className="flex flex-col gap-2 p-4 border rounded-lg shadow">
      <div className="flex justify-between">
        <div className="flex justify-between items-center gap-4">
          <h3 className="font-medium">Google</h3>
          {loggedUsers.length === 0 && (
            <div className="text-yellow-600 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
              Not authorized
            </div>
          )}
        </div>
        {loggedUsers.length === 0 && (
          <Button
            text="Sign In"
            callback={signInHandler}
            status={`${loading ? "loading" : ""}`}
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        {loggedUsers &&
          loggedUsers.length > 0 &&
          loggedUsers.map((user, i) => (
            <UserStatusPanel
              key={i}
              googleUsername={user.userName}
              signOutHandler={signOutHandler}
            />
          ))}
        {loggedUsers.length > 0 && (
          <div className="self-end">
            <Button
              text="Add account"
              callback={signInHandler}
              status={`${loading ? "loading" : ""}`}
            />
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 w-[80%]">
        After connection, you will be able to fill in the Report with the
        information from events of your Google Calendar
      </p>
      {loggedUsers?.length > 0 && (
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
