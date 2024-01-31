import { TrelloConnection } from "../TrelloConnection";
import { GoogleConnection } from "../GoogleConnection";
import { Office365Connection } from "../Office365Connection";
import { JiraConnection } from "../JiraConnection";
import { TimetrackerWebsiteConnection } from "../TimetrackerWebsiteConncetion";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { useEffect, useState } from "react";

const ConnectionsSection = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    global.ipcRenderer.on("net-connection", (_, connection) => {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      console.log(
        connection.code === "wlan_notification_acm_disconnected"
          ? "Disconected"
          : "Connected"
      );
    });
    return () => {
      global.ipcRenderer.removeAllListeners(
        IPC_MAIN_CHANNELS.INTERNET_CONNECTION_STATUS
      );
    };
  }, []);

  return (
    <section className="h-full">
      <div className="overflow-y-auto h-full bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-medium text-gray-900 dark:text-dark-heading">
            Connections
          </span>
          <p className="text-sm text-gray-500">
            You can connect available resources to use their capabilities to
            complete your reports
          </p>
        </div>
        <TrelloConnection isOnline={isOnline} />
        <GoogleConnection isOnline={isOnline} />
        <Office365Connection isOnline={isOnline} />
        <JiraConnection isOnline={isOnline} />
        <TimetrackerWebsiteConnection isOnline={isOnline} />
      </div>
    </section>
  );
};

export default ConnectionsSection;
