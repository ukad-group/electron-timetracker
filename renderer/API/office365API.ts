import { LogLevel } from "@azure/msal-browser";

const PORT = process.env.NEXT_PUBLIC_PORT;
const CLIENT_ID = process.env.NEXT_PUBLIC_OFFICE365_CLIENT_ID;

export const msalConfig = {
  auth: {
    clientId: CLIENT_ID,
    redirectUri: `http://localhost:${PORT}/settings`,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
};

export const loginRequest = {
  scopes: ["User.Read", "Calendars.Read"],
  prompt: "consent",
};

export const silentRequest = {
  scopes: ["User.Read", "Calendars.Read"],
  prompt: "none",
};

export const endpoints = {
  me: "https://graph.microsoft.com/v1.0/me",
  events: "https://graph.microsoft.com/v1.0/me/events",
};

export async function callProfileInfoGraph(accessToken: string) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(endpoints.me, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function callTodayEventsGraph(accessToken: string) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59);

  const filter = `?$filter=start/dateTime ge '${startOfDay.toISOString()}' and start/dateTime le '${endOfDay.toISOString()}'`;

  return fetch(`${endpoints.events}?${filter}`, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}
