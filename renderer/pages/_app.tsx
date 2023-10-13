import React from "react";
import type { AppProps } from "next/app";
import "../styles/global.css";
import dynamic from "next/dynamic";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../API/office365API";
import Head from "next/head";
import "../components/Calendar/Calendar.css";
import "../components/ui/Tooltip/Tooltip.css";

const msalInstance = new PublicClientApplication(msalConfig);

function App({ Component, pageProps }: AppProps) {
  // return <Component {...pageProps} />;
  const AnyComponent = Component as any; // need review this
  return (
    <>
      <Head>
        <title>UKAD Timetrecker</title>
      </Head>
      <MsalProvider instance={msalInstance}>
        <AnyComponent {...pageProps} />
      </MsalProvider>
    </>
  );
}

export default dynamic(() => Promise.resolve(App), {
  ssr: false,
});
