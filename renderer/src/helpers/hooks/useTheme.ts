import { useState, useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { shallow } from "zustand/shallow";

const useTheme = () => {
  const [isOSDarkTheme, setIsOSDarkTheme] = useState(true);

  const [theme, setTheme] = useThemeStore((state) => [state.theme, state.setTheme], shallow);

  const handleThemeChange = (e) => (e.matches ? setIsOSDarkTheme(true) : setIsOSDarkTheme(false));

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

    mediaQueryList.addListener(handleThemeChange);
    setIsOSDarkTheme(mediaQueryList.matches);

    const isDarkTheme = (theme.os && isOSDarkTheme) || (!theme.os && theme.custom === "dark");

    document.body.className = isDarkTheme ? "dark bg-dark-back" : "light bg-grey-100";

    return () => {
      mediaQueryList.removeListener(handleThemeChange);
    };
  }, [theme, isOSDarkTheme]);

  return { theme, setTheme };
};

export default useTheme;
