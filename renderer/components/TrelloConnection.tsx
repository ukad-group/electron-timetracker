import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/24/solid";
import Button from "./ui/Button";
import { getMember, getTrelloAuthUrl } from "../API/trelloAPI";

const PORT = process.env.NEXT_PUBLIC_PORT;
const TRELLO_KEY = process.env.NEXT_PUBLIC_TRELLO_KEY;
const RETURN_URL = `http://localhost:${PORT}/settings`;

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
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSignInButton = () => {
    const authUrl = getTrelloAuthUrl({
      key: TRELLO_KEY,
      returnUrl: RETURN_URL,
    });

    router.push(authUrl);
  };

  const handleSignOutButton = () => {
    localStorage.removeItem("trelloToken");
    setToken("");
    router.push("/settings");
  };

  useEffect(() => {
    if (window.location.hash.includes("token")) {
      const tokenFromUrl = extractTokenFromString(window.location.hash);

      localStorage.setItem("trelloToken", tokenFromUrl);
      setToken(tokenFromUrl);
    }

    if (Boolean(localStorage.getItem("trelloToken"))) {
      const storedToken = localStorage.getItem("trelloToken") as string;

      setToken(storedToken);

      (async () => {
        const trelloMember = await getMember({
          token: storedToken,
          key: TRELLO_KEY,
        });

        if (trelloMember && trelloMember.username) {
          setUsername(trelloMember.username);
        }
      })();
    }
  }, []);

  return (
    <div className="p-4 flex items-start justify-between gap-6 border rounded-lg shadow">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <span className="font-medium">Trello</span>
          {token.length > 0 && (
            <div className="text-green-700 inline-flex gap-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200">
              Already authorized
              <CheckIcon className="w-4 h-4 fill-green-700" />
            </div>
          )}
          {token.length > 0 && username.length > 0 && (
            <div className="inline-flex  px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-white">
              {username}
            </div>
          )}
          {!token.length && (
            <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
              Not authorized
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">
          After connection, you will be able to fill in the Description field
          with tasks from the drop-down list
        </p>
      </div>
      <div className="flex-shrink-0">
        {token.length > 0 ? (
          <Button
            text="Sign Out"
            callback={handleSignOutButton}
            type="button"
          />
        ) : (
          <Button text="Sign In" callback={handleSignInButton} type="button" />
        )}
      </div>
    </div>
  );
};

export default TrelloConnection;
