import React, { useEffect, useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import {
  callCalendarGraph,
  callMsGraph,
  loginRequest,
} from "../API/office365API";
import { CheckIcon } from "@heroicons/react/24/solid";
import Button from "./ui/Button";

const PORT = process.env.NEXT_PUBLIC_PORT;
const REDIRECT_URI = `http://localhost:${PORT}/settings`;

const Office365Connection = () => {
  const [username, setUsername] = useState("");
  const [hasUserMailbox, setHasUserMailbox] = useState(true);
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [isLoading, setIsLoading] = useState(true);

  const handleSignInButton = () => {
    instance.loginPopup(loginRequest).catch((e) => {
      console.log(e);
    });
  };

  const handleSignOutButton = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: REDIRECT_URI,
      mainWindowRedirectUri: REDIRECT_URI,
    });
  };

  const getAccessToken = async () => {
    const { accessToken } = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });

    return accessToken;
  };

  const getUsername = async () => {
    const accessToken = await getAccessToken();
    const response = await callMsGraph(accessToken);
    setUsername(response.userPrincipalName);
  };

  const checkIfUserHasMailbox = async () => {
    const accessToken = await getAccessToken();
    const response = await callCalendarGraph(accessToken);

    if (response?.error) {
      setHasUserMailbox(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        getUsername();
        checkIfUserHasMailbox();
        setIsLoading(false);
      })();
    }
  }, [isAuthenticated]);

  return (
    <div className="p-4 flex items-start justify-between gap-6 border rounded-lg shadow">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <span className="font-medium">Office 365</span>
          {isAuthenticated && (
            <div className="text-green-700 inline-flex gap-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200">
              Already authorized
              <CheckIcon className="w-4 h-4 fill-green-700" />
            </div>
          )}
          {isAuthenticated && username.length > 0 && (
            <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-white">
              {username}
            </div>
          )}
          {!isAuthenticated && (
            <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
              Not authorized
            </div>
          )}
        </div>
        {isAuthenticated && !hasUserMailbox && !isLoading && (
          <p className="text-sm text-red-500">
            User has no mailbox. Try to Sign In to another account
          </p>
        )}
        <p className="text-sm text-gray-500">
          After connection, you will be able to fill in the Report with the
          information from events of your Microsoft Outlook Calendar
        </p>
      </div>
      <div className="flex-shrink-0">
        {isAuthenticated ? (
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

export default Office365Connection;
