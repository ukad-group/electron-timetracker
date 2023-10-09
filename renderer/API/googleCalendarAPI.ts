const redirectURI = "http://localhost:8000/settings";
const scope =
  "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.profile";

export const getGoogleAuthUrl = () => {
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/auth");

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectURI,
    access_type: "offline",
    response_type: "code",
  });

  googleAuthUrl.search = params.toString();

  return googleAuthUrl.toString();
};

export const getGoogleCredentials = async (authCode: string) => {
  if (!authCode) return;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `code=${authCode}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectURI}&grant_type=authorization_code`,
  });

  if (!response.ok) throw new Error();

  return response.json();
};

export const updateGoogleCredentials = async (refreshToken: string) => {
  if (!refreshToken) return;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}&grant_type=refresh_token`,
  });

  if (!response.ok) throw new Error();

  return response.json();
};

export const getGoogleEvents = async (token: string) => {
  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0);
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59);

  const googleEventsUrl = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events"
  );

  const params = new URLSearchParams({
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
  });

  googleEventsUrl.search = params.toString();

  const response = await fetch(googleEventsUrl.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 401) {
    throw new Error();
  }

  return response.json();
};

export const getGoogleUsername = async (googleAccessToken: string) => {
  const response = await fetch(
    "https://people.googleapis.com/v1/people/me?personFields=names",
    {
      headers: {
        Authorization: `Bearer ${googleAccessToken}`,
      },
    }
  );

  if (!response.ok) throw new Error();

  return response.json();
};
