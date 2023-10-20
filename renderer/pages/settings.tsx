import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import { getMember, getTrelloAuthUrl } from "../API/trelloAPI";
import FolderSelector from "../components/FolderSelector";
import GoogleCalendarAuth from "../components/google-calendar/GoogleCalendarAuth";
import Button from "../components/ui/Button";
import { useGoogleCalendarStore } from "../store/googleCalendarStore";
import { useMainStore } from "../store/mainStore";
import Tooltip from "../components/ui/Tooltip/Tooltip";

const TRELLO_KEY = process.env.NEXT_PUBLIC_TRELLO_KEY;
const RETURN_URL = "http://localhost:51432/settings";

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

const SettingsPage = () => {
  const [token, setToken] = useState("");
  const [trelloUsername, setTrelloUsername] = useState("");
  const router = useRouter();
  const [reportsFolder, setReportsFolder] = useMainStore(
    (state) => [state.reportsFolder, state.setReportsFolder],
    shallow
  );
  const { isLogged, googleUsername, googleEvents, setGoogleEvents } =
    useGoogleCalendarStore();
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);

  const handleSignInTrelloButton = () => {
    const trelloAuthUrl = getTrelloAuthUrl({
      key: TRELLO_KEY,
      returnUrl: RETURN_URL,
    });

    router.push(trelloAuthUrl);
  };

  const handleSignOutTrelloButton = () => {
    localStorage.removeItem("trelloToken");
    setToken("");
    router.push("/settings");
  };

  const resetGoogleEventsHandle = () => {
    const resetedGoogleEvents = googleEvents.map((gEvent) => {
      gEvent.isAdded = false;

      return gEvent;
    });

    localStorage.setItem("googleEvents", JSON.stringify(resetedGoogleEvents));
    setGoogleEvents(resetedGoogleEvents);
  };

  const handleCheckboxChange = () => {
    setShowGoogleEvents((prev) => !prev);
    const reversShowGoogleEvents = !showGoogleEvents;
    localStorage.setItem("showGoogleEvents", reversShowGoogleEvents.toString());
  };

  useEffect(() => {
    const lsShowGoogleEvents = localStorage.getItem("showGoogleEvents");
    if (lsShowGoogleEvents === "true") {
      setShowGoogleEvents(true);
    }
  }, []);

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
          setTrelloUsername(trelloMember.username);
        }
      })();
    }
  }, []);

  return (
    <div className="mx-auto sm:px-6 max-w-3xl flex flex-col gap-6 px-6 py-10">
      <section>
        <div className="bg-white shadow sm:rounded-lg p-6 flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Settings</span>
          <Link href="/">
            <div className="flex justify-end items-center flex-shrink min-w-0 gap-4">
              <XMarkIcon
                className="w-6 h-6 cursor-pointer"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </section>
      <section>
        <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-medium text-gray-900">
              Folder with reports
            </span>
            <p className="text-sm text-gray-500">
              Specify the path on your computer where your reports will be saved
            </p>
          </div>
          <div className="flex w-full items-center flex-shrink min-w-0 gap-4">
            <FolderSelector
              folderLocation={reportsFolder}
              setFolderLocation={setReportsFolder}
            />
          </div>
        </div>
      </section>
      <section>
        <div className="bg-white shadow sm:rounded-lg p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-lg font-medium text-gray-900">
              Connections
            </span>
            <p className="text-sm text-gray-500">
              You can connect available resources to use their capabilities to
              complete your reports
            </p>
          </div>
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
                {token.length > 0 && trelloUsername.length > 0 && (
                  <div className="inline-flex  px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-white">
                    {trelloUsername}
                  </div>
                )}
                {!token.length && (
                  <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100">
                    Not authorized
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                After connection, you will be able to fill in the Description
                field with tasks from the drop-down list
              </p>
            </div>
            <div className="flex-shrink-0">
              {token.length > 0 ? (
                <Button
                  text="Sign Out"
                  callback={handleSignOutTrelloButton}
                  type="button"
                />
              ) : (
                <Button
                  text="Sign In"
                  callback={handleSignInTrelloButton}
                  type="button"
                />
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg shadow flex flex-col gap-6">
            <div className="flex items-start justify-between gap-6">
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
                  After connection, you will be able to fill in the Report with
                  the information from events of your Google Calendar
                </p>
              </div>
              <GoogleCalendarAuth />
            </div>

            {isLogged && (
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

            {isLogged && googleEvents.length > 0 && (
              <div className="flex items-start justify-between gap-6">
                <p className=" max-w-lg text-sm text-gray-500">
                  Make all Google events visible again. This can be useful when
                  you have added an event and accidentally deleted it manually
                </p>
                <Tooltip tooltipText="reseted">
                  <button
                    onClick={resetGoogleEventsHandle}
                    className="text-gray-500 inline-flex items-center justify-center px-2 py-1 text-xs border rounded-md shadow-sm hover:bg-gray-100 "
                  >
                    reset
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
