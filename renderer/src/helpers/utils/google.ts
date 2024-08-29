import { getGoogleEvents, updateGoogleCredentials } from "@/API/googleCalendarAPI";
import { trackConnections } from "./utils";
import { LOCAL_STORAGE_VARIABLES, TRACK_ANALYTICS } from "../constants";

export const loadGoogleEvents = async (accessToken: string, refreshToken: string, index: number) => {
  try {
    const data = await getGoogleEvents(accessToken);

    // detect expired token
    if (data?.error && data?.error?.code === 401) {
      const updatedCredentials = await updateGoogleCredentials(refreshToken);
      const newAccessToken = updatedCredentials?.access_token;
      const usersLs = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.GOOGLE_USERS));

      usersLs[index].googleAccessToken = newAccessToken;
      localStorage.setItem(LOCAL_STORAGE_VARIABLES.GOOGLE_USERS, JSON.stringify(usersLs));

      return await loadGoogleEvents(newAccessToken, refreshToken, index);
    }

    if (data?.items) return data.items;

    return [];
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

export const loadGoogleEventsFromAllUsers = async () => {
  const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.GOOGLE_USERS)) || [];

  if (!storedUsers.length) return [];

  trackConnections(TRACK_ANALYTICS.GOOGLE_CALENDAR);

  const userPromises = storedUsers.map((user, i) =>
    loadGoogleEvents(user.googleAccessToken, user.googleRefreshToken, i),
  );
  const userEvents = await Promise.all(userPromises);

  return userEvents.flat();
};
