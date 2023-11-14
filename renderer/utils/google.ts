import { getGoogleEvents, updateGoogleCredentials } from "../API/googleCalendarAPI";

export const loadGoogleEvents = async (
  accessToken: string,
  refreshToken: string,
  index: number
) => {
  try {
    const data = await getGoogleEvents(accessToken);

    // detect expired token
    if (data?.error && data?.error?.code === 401) {
      const updatedCredentials = await updateGoogleCredentials(refreshToken);
      const newAccessToken = updatedCredentials?.access_token;
      const usersLs = JSON.parse(localStorage.getItem("googleUsers"));

      usersLs[index].googleAccessToken = newAccessToken;
      localStorage.setItem("googleUsers", JSON.stringify(usersLs));

      return "expired-token";
    }

    return data?.items;
  } catch (error) {
    console.error(error);

    return [];
  }
};

export const loadGoogleEventsFromAllUsers = async () => {
  const storedUsers = JSON.parse(localStorage.getItem("googleUsers")) || [];

  if (!storedUsers.length) return [];

  const userPromises = storedUsers.map((user, i) =>
    loadGoogleEvents(user.googleAccessToken, user.googleRefreshToken, i)
  );
  const userEvents = await Promise.all(userPromises);

  if (userEvents.includes("expired-token")) {
    loadGoogleEventsFromAllUsers();
    return [];
  }

  const flattenedEvents = userEvents.flat();

  return flattenedEvents;
};