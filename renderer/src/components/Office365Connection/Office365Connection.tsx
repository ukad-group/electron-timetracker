import React, { useEffect, useState } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { Button } from "../../shared/Button";
import isOnline from "is-online";
import { Office365User } from "../../helpers/utils/office365";
import { IPC_MAIN_CHANNELS } from "../../../../electron-src/helpers/constants";

const Office365Connection = () => {
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("office365-users")) || []
  );
  const [showEventsInTable, setShowEventsInTable] = useState(false);

  const handleSignInButton = async () => {
    const online = await isOnline();

    if (online) {
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.OFFICE365_LOGIN);
    } else {
      global.ipcRenderer.send(IPC_MAIN_CHANNELS.LOAD_OFFLINE_PAGE);
    }
  };

  const handleSignOutButton = (id: string) => {
    const filteredUsers = users.filter(
      (user: Office365User) => user.userId !== id
    );

    if (filteredUsers.length > 0) {
      localStorage.setItem("office365-users", JSON.stringify(filteredUsers));
    } else {
      localStorage.removeItem("office365-users");
      localStorage.removeItem("showOffice365Events");
    }

    setUsers(filteredUsers);
  };

  const addUser = async () => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");

    const { access_token, refresh_token } = await global.ipcRenderer.invoke(
      "office365:get-tokens",
      authorizationCode
    );

    if (!access_token) return;

    const { userPrincipalName, mail, displayName, id } =
      await global.ipcRenderer.invoke(
        "office365:get-profile-info",
        access_token
      );

    const username = userPrincipalName || mail || displayName || "";
    const isUserExists = users.some(
      (user: Office365User) => id === user.userId
    );

    if (isUserExists) {
      alert(`Account ${username} has already logged`);
      return;
    }

    const user = {
      userId: id,
      accessToken: access_token,
      refreshToken: refresh_token,
      username: username,
    };
    global.ipcRenderer.send(
      IPC_MAIN_CHANNELS.ANALYTICS_DATA,
      "calendars_connections",
      {
        calendar: "office365",
      }
    );
    const newUsers = [...users, user];

    localStorage.setItem("office365-users", JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const handleCheckboxChange = () => {
    localStorage.setItem(
      "showOffice365Events",
      (!showEventsInTable).toString()
    );
    setShowEventsInTable(!showEventsInTable);
  };

  useEffect(() => {
    if (
      window.location.search.includes("code") &&
      window.location.search.includes("state=office365code") &&
      !window.location.search.includes("error")
    ) {
      (async () => addUser())();
    }

    if (localStorage.getItem("showOffice365Events") === "true") {
      setShowEventsInTable(true);
    }
  }, []);

  return (
    <div className="p-4 flex flex-col items-start justify-between gap-2 border rounded-lg shadow dark:border-dark-form-border">
      <div className="flex justify-between items-center w-full ">
        <span className="font-medium dark:text-dark-heading">
          Microsoft Office 365
        </span>
        {!users.length && (
          <Button
            text="Add account"
            callback={handleSignInButton}
            type="button"
          />
        )}
        {users.length > 0 && (
          <button
            onClick={handleSignInButton}
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border shadow-sm dark:border-dark-form-border"
          >
            <span className="hover:underline text-gray-500 dark:text-dark-main">
              Add another account
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 w-full">
        {!users.length && (
          <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/20">
            No one user authorized
          </div>
        )}

        {users.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {users.map((user) => (
              <div key={user.userId} className="flex gap-4 items-center">
                <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-blue-900 dark:text-blue-400 dark:bg-blue-400/20">
                  {user.username}
                </div>
                <div
                  onClick={() => handleSignOutButton(user.userId)}
                  className="cursor-pointer bg-gray-400 hover:bg-gray-500 transition duration-300 inline-flex gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white dark:text-dark-heading dark:bg-dark-button-back-gray dark:hover:bg-dark-button-gray-hover"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 fill-white dark:fill-dark-heading" />
                  Sign Out
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500  dark:text-dark-main">
        After connection, you will be able to fill in the Report with the
        information from events of your Microsoft Outlook Calendar
        <br />
        You can authorize with a work, or personal Microsoft account (e.g.
        Skype, Xbox)
      </p>
      {users.length > 0 && (
        <div className="flex items-start justify-between gap-6 w-full">
          <p className=" max-w-sm text-sm text-gray-500 dark:text-dark-main">
            Show Office365 events in activity table
          </p>
          <div>
            <input
              onChange={handleCheckboxChange}
              className="w-4 h-4"
              type="checkbox"
              checked={showEventsInTable}
            ></input>
          </div>
        </div>
      )}
    </div>
  );
};

export default Office365Connection;
