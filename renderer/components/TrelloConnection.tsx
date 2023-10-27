import React, { useEffect, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
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
    if (window.location.hash.includes("token") && !window.location.hash.includes("error")) {
      (async () => addUser())();
    }
  }, []);

  return (
    <div className="p-4 flex flex-col items-start justify-between gap-2 border rounded-lg shadow">
      <div className="flex justify-between items-center w-full">
        <span className="font-medium">Trello</span>
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
          <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
            No one user authorized
          </div>
        )}

        {user && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-4 items-center">
              <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-blue-900">
                {user.username}
              </div>
              <div
                onClick={handleSignOutButton}
                className="cursor-pointer bg-gray-400 hover:bg-gray-500 transition duration-300 inline-flex gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 fill-white" />
                Sign Out
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500">
        After connection, you will be able to fill in the Description field with
        tasks from the drop-down list
      </p>
    </div>
  );
};

export default TrelloConnection;
