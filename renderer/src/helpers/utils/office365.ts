import { LOCAL_STORAGE_VARIABLES, TRACK_CONNECTIONS } from "../contstants";
import { trackConnections } from "./utils";
export interface Office365User {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
}

export const updateAccessToken = async (refreshToken: string) =>
  await global.ipcRenderer.invoke("office365:refresh-access-token", refreshToken);

export const removeStoredUser = (userId: string) => {
  const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_USERS)) || [];
  const filteredUsers = storedUsers.filter((user: Office365User) => user.userId !== userId);

  if (filteredUsers.length > 0) {
    localStorage.setItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_USERS, JSON.stringify(filteredUsers));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_USERS);
  }
};

export const updateStoredUser = (userId: string, newAccessToken: string) => {
  const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_USERS)) || [];
  const updatedUsers = storedUsers.map((user: Office365User) => {
    if (user.userId === userId) {
      return { ...user, accessToken: newAccessToken };
    } else {
      return user;
    }
  });

  localStorage.setItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_USERS, JSON.stringify(updatedUsers));
};

export const getOffice365Events = async () => {
  const storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.OFFICE_365_USERS)) || [];

  if (!storedUsers.length) return [];

  trackConnections(TRACK_CONNECTIONS.OFFICE365_CALENDAR);

  const usersPromises = storedUsers.map((user: Office365User) => {
    const { accessToken, refreshToken, userId } = user;

    return getOffice365EventByUser(accessToken, refreshToken, userId);
  });
  const promisedOffice365Events = await Promise.all(usersPromises);

  return promisedOffice365Events.reduce((acc, curr) => (!curr ? acc : [...acc, ...curr]), []);
};

export const getOffice365EventByUser = async (accessToken: string, refreshToken: string, userId: string) => {
  let res = await global.ipcRenderer.invoke("office365:get-today-events", accessToken);

  if (res?.error?.code === "MailboxNotEnabledForRESTAPI") {
    return [];
  }

  if (res?.error) {
    const data = await updateAccessToken(refreshToken);

    if (!data?.access_token) {
      removeStoredUser(userId);
      return;
    } else {
      updateStoredUser(userId, data.access_token);

      return await getOffice365EventByUser(data.access_token, refreshToken, userId);
    }
  }

  if (res?.value) return res.value;

  return [];
};
