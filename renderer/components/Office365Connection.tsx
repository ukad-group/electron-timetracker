import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon } from "@heroicons/react/24/solid";
import Button from "./ui/Button";

const Office365Connection = () => {
  const [code, setCode] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [username, setUsername] = useState("");
  const [hasUserMailbox, setHasUserMailbox] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleSignInButton = () => {
    global.ipcRenderer.send('office365:login');
  };

  const handleSignOutButton = () => {
    localStorage.removeItem("office365Token");
    setAccessToken("");
    router.push("/settings");
  }

  const getAccessToken = async () => {
    const res = await global.ipcRenderer.invoke(
      'office365:get-tokens', code);

    setAccessToken(res.access_token);
    localStorage.setItem("office365Token", res.access_token);
  }

  const getUsername = async () => {
    const res = await global.ipcRenderer.invoke(
      'office365:get-profile-info', accessToken);

    setUsername(res.userPrincipalName || res.mail || '')
  }

  const checkIfUserHasMailbox = async () => {
    const res = await global.ipcRenderer.invoke(
      'office365:get-today-events', accessToken);

    if (res?.error) {
      setHasUserMailbox(false);
    }
  };

  useEffect(() => {
    if (!Boolean(localStorage.getItem("office365Token")) && window.location.search.includes("code")) {
      const params = new URLSearchParams(window.location.search);
      const authorizationCode = params.get("code");

      setCode(authorizationCode)
    }

    if (Boolean(localStorage.getItem("office365Token"))) {
      const storedToken = localStorage.getItem("office365Token") as string;

      setAccessToken(storedToken);
    }

  }, [])

  useEffect(() => {
    (async () => {
      if (code) {
        getAccessToken()
      }
    })()
  }, [code])

  useEffect(() => {
    (async () => {
      if (accessToken) {
        getUsername()
        checkIfUserHasMailbox()
        setIsLoading(false);
      }
    })()
  }, [accessToken])



  return (
    <div className="p-4 flex items-start justify-between gap-6 border rounded-lg shadow">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <span className="font-medium">Office 365</span>
          {accessToken && (
            <div className="text-green-700 inline-flex gap-2 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-200">
              Already authorized
              <CheckIcon className="w-4 h-4 fill-green-700" />
            </div>
          )}
          {accessToken && username.length > 0 && (
            <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-white">
              {username}
            </div>
          )}
          {!accessToken && (
            <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
              Not authorized
            </div>
          )}
        </div>
        {accessToken && !hasUserMailbox && !isLoading && (
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
        {accessToken ? (
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
