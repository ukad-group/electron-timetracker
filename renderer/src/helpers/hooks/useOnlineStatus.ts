import { useState, useEffect } from 'react';
import { UseOnlineStatusTypes } from './types';

const useOnlineStatus = (trigger: boolean): UseOnlineStatusTypes => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const updateOnlineStatus = () => {
    setIsOnline(navigator.onLine);
  };

  useEffect(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [trigger]); // <--- It's a temporary solution. Have to find a new one to replace the trigger logic.

  return { isOnline, updateOnlineStatus };
};

export default useOnlineStatus;