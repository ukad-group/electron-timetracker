import React from "react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { shallow } from "zustand/shallow";
import { useThemeStore } from "../store/themeStore";
import type { AppProps } from "next/app";
import "../styles/global.css";
import "../components/Calendar/Calendar.css";
import "../components/ui/Tooltip/Tooltip.css";
import dynamic from "next/dynamic";
import Head from "next/head";
// import { MsalProvider } from "@azure/msal-react";
// import { PublicClientApplication } from "@azure/msal-browser";
// import { msalConfig } from "../API/office365API";

// const msalInstance = new PublicClientApplication(msalConfig);

function App({ Component, pageProps }: AppProps) {
  // return <Component {...pageProps} />;
  const AnyComponent = Component as any; // need review this
  const [theme, setTheme] = useThemeStore(
    (state) => [state.theme, state.setTheme],
    shallow
  );
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isOSDarkTheme, setIsOSDarkTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  function handleThemeChange(e) {
    if (e.matches) {
      setIsOSDarkTheme(true);
    } else {
      setIsOSDarkTheme(false);
    }
  }

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addListener(handleThemeChange);
    console.log(theme);

    setIsDarkTheme(theme.os ? isOSDarkTheme : theme.custom === "dark");
  }, [theme, isOSDarkTheme]);
  return (
    <div
      className={clsx("h-full bg-gray-100 dark:bg-dark-back", {
        dark: isDarkTheme,
      })}
    >
      <Head>
        <title>UKAD Timetracker</title>
      </Head>
      {/* <MsalProvider instance={msalInstance}> */}
      <AnyComponent {...pageProps} />
      {/* </MsalProvider> */}
    </div>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
