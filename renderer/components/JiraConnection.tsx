import React, { useEffect, useState } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import Button from "./ui/Button";
import isOnline from "is-online";
import { JiraUser } from "../utils/jira";
import { FlagIcon } from "@heroicons/react/24/outline";

const JiraConnection = () => {
  const [users, setUsers] = useState(
    JSON.parse(localStorage.getItem("jira-users")) || []
  );

  const handleSignInButton = async () => {
    const online = await isOnline();

    if (online) {
      global.ipcRenderer.send("jira:login");
    } else {
      global.ipcRenderer.send("app:load-offline-page");
    }
  };

  const handleSignOutButton = (id: string) => {
    const filteredUsers = users.filter((user: JiraUser) => user.userId !== id);

    if (filteredUsers.length > 0) {
      localStorage.setItem("jira-users", JSON.stringify(filteredUsers));
    } else {
      localStorage.removeItem("jira-users");
    }

    setUsers(filteredUsers);
  };

  const addUser = async () => {
    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");

    const { access_token, refresh_token } = await global.ipcRenderer.invoke(
      "jira:get-tokens",
      authorizationCode
    );

    if (!access_token) return;

    const { account_id, email, nickname } = await global.ipcRenderer.invoke(
      "jira:get-profile",
      access_token
    );

    const username = email || nickname || "";
    const isUserExists = users.some(
      (user: JiraUser) => account_id === user.userId
    );

    if (isUserExists) {
      alert(`Account ${username} has already logged`);
      return;
    }

    const user = {
      userId: account_id,
      accessToken: access_token,
      refreshToken: refresh_token,
      username: username,
      nickname: nickname,
    };

    const newUsers = [...users, user];

    localStorage.setItem("jira-users", JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  useEffect(() => {
    if (
      window.location.search.includes("code") &&
      window.location.search.includes("state=jiracode") &&
      !window.location.search.includes("error")
    ) {
      (async () => addUser())();
    }
  }, []);

  return (
    <div className="p-4 flex flex-col items-start justify-between gap-2 border rounded-lg shadow dark:border-dark-form-border">
      <div className="flex justify-between items-center w-full ">
        <span className="font-medium dark:text-dark-heading">Jira</span>
        {!users.length && (
          <Button
            text="Add account"
            callback={handleSignInButton}
            type="button"
          />
        )}
        {/* {users.length > 0 && (
          <button
            onClick={handleSignInButton}
            type="button"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border shadow-sm dark:border-dark-form-border"
          >
            <span className="hover:underline text-gray-500 dark:text-dark-main">
              Add another account
            </span>
          </button>
        )} */}
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
        After connection, you will be able to fill in the Description field with
        tasks from the drop-down list. Just begin typing and in the drop-down
        list you will see Jira tasks that starting with "J::".
        <br />
        You can see only those tasks, where you are an assignee
        <br />
        <span className="flex gap-2 items-center">
          <FlagIcon className="w-4 h-4" />
          Ensure you have a Jira account connected to your Atlassian account.
        </span>
      </p>
    </div>
  );
};

export default JiraConnection;
