import { useState, useEffect } from "react";

const useScreenSizes = () => {
  const [screenSizes, setScreenSizes] = useState({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSizes({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return { screenSizes, setScreenSizes };
};

export default useScreenSizes;
