import React, { useEffect, useState } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import Button from "./ui/Button";

function extractTokenFromString(inputString: string) {
  const parts = inputString.split("#");

  if (parts.length >= 2) {
    const afterHash = parts[1];
    const tokenPart = afterHash.split("=");

    if (tokenPart.length === 2 && tokenPart[0] === "token") {
      return tokenPart[1];
    }
  }

  return "";
}

const TrelloConnection = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("trello-user")) || null
  );

  const handleSignInButton = () => {
    global.ipcRenderer.send("trello:login");
  };

  const handleSignOutButton = () => {
    localStorage.removeItem("trello-user");
    setUser(null);
  };

  const addUser = async () => {
    const tokenFromUrl = extractTokenFromString(window.location.hash);

    const { id, username, fullName } = await global.ipcRenderer.invoke(
      "trello:get-profile-info",
      tokenFromUrl
    );

    const newUser = {
      userId: id,
      accessToken: tokenFromUrl,
      username: username || fullName || "",
    };

    localStorage.setItem("trello-user", JSON.stringify(newUser));
    setUser(newUser);
  };

  useEffect(() => {
    if (
      window.location.hash.includes("token") &&
      !window.location.hash.includes("error")
    ) {
      (async () => addUser())();
    }
  }, []);

  return (
    <div className="p-4 flex flex-col items-start justify-between gap-2 border rounded-lg shadow dark:border-dark-form-border">
      <div className="flex justify-between items-center w-full">
        <span className="font-medium dark:text-dark-heading">Trello</span>
        {!user && (
          <Button
            text="Add account"
            callback={handleSignInButton}
            type="button"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-4 w-full">
        {!user && (
          <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:text-yellow-400/70 dark:bg-yellow-400/20">
            No one user authorized
          </div>
        )}

        {user && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-4 items-center">
              <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-blue-900 dark:text-blue-400/80 dark:bg-blue-500/40">
                {user.username}
              </div>
              <div
                onClick={handleSignOutButton}
                className="cursor-pointer bg-gray-400 hover:bg-gray-500 transition duration-300 inline-flex gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white dark:text-dark-heading dark:bg-dark-button-back-gray dark:hover:bg-dark-button-gray-hover dark:border dark:border-dark-border"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 fill-white dark:fill-dark-heading " />
                Sign Out
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-dark-main">
        After connection, you will be able to fill in the Description field with
        tasks from the drop-down list. Just begin typing and in the drop-down
        list you will see Trello tasks that starting with "TT::". You can see
        only those tasks you joined in Trello
      </p>
    </div>
  );
};

export default TrelloConnection;
