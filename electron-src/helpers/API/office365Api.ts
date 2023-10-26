const PORT = 51432;
const CLIENT_ID = "121f1464-4342-4093-a1ab-7a949e65c251";
const scope = "profile email offline_access openid User.Read Calendars.Read"
const redirectUri = `http://localhost:${PORT}/settings`

export const getAuthUrl = () => {
  const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: redirectUri,
    prompt: "login",
    response_type: "code",
  });

  authUrl.search = params.toString();

  return authUrl.toString();
};

export const getTokens = async (authCode: string, clientSecret: string) => {
  if (!authCode) return;

  const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `code=${authCode}&client_id=${CLIENT_ID}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&grant_type=authorization_code&scope=${scope}`,
  });

  // if (!response.ok) throw new Error();

  return response.json();
}

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
