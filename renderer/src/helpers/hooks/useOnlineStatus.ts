import { useState, useEffect } from "react";
import { UseOnlineStatusTypes } from "./types";

const useOnlineStatus = (): UseOnlineStatusTypes => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const updateOnlineStatus = () => {
    console.log("Hook", navigator.onLine);
    setIsOnline(navigator.onLine);
  };

  useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [isOnline]);

  return { isOnline, updateOnlineStatus };
};

export default useOnlineStatus;
