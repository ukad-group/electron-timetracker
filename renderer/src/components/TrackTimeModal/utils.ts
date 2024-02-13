import { LOCAL_STORAGE_VARIABLES } from "@/helpers/contstants";
import { IPC_MAIN_CHANNELS } from "@electron/helpers/constants";
import { KEY_CODES } from "@/helpers/contstants";

export const changeHours = (eventKey: string, hours: number) => {
  let newHours = hours;

  if (eventKey === KEY_CODES.ARROW_UP) {
    newHours += 1;
  } else if (eventKey === KEY_CODES.ARROW_DOWN) {
    newHours -= 1;
  }

  if (newHours < 0) {
    newHours = 23;
  } else if (newHours >= 24) {
    newHours = 0;
  }

  return newHours;
};

export const changeMinutesAndHours = (eventKey: string, minutes: number, hours: number) => {
  let newMinutes = minutes;
  let newHours = hours;

  if (eventKey === KEY_CODES.ARROW_UP) {
    newMinutes += 15;
  } else if (eventKey === KEY_CODES.ARROW_DOWN) {
    newMinutes -= 15;
  }

  if (newMinutes < 0) {
    newHours = changeHours(eventKey, hours);
    newMinutes += 60;
  } else if (newMinutes >= 60) {
    newHours = changeHours(eventKey, hours);
    newMinutes -= 60;
  }

  return [newMinutes, newHours];
};

export const getTimetrackerYearProjects = async (setWebTrackerProjects) => {
  const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_USER));

  if (!userInfo) return;

  const timetrackerCookie = userInfo?.TTCookie;

  try {
    const yearProjects = await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.TIMETRACKER_GET_PROJECTS, timetrackerCookie);

    if (yearProjects === "invalid_token") {
      const refresh_token = userInfo?.userInfoRefreshToken;

      if (!refresh_token) return;

      const updatedCreds = await global.ipcRenderer.invoke(
        IPC_MAIN_CHANNELS.TIMETRACKER_REFRESH_USER_INFO_TOKEN,
        refresh_token,
      );

      const updatedIdToken = updatedCreds?.id_token;

      const updatedCookie = await global.ipcRenderer.invoke(IPC_MAIN_CHANNELS.TIMETRACKER_LOGIN, updatedIdToken);

      const updatedUser = {
        ...userInfo,
        userInfoIdToken: updatedIdToken,
        TTCookie: updatedCookie,
      };

      localStorage.setItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_USER, JSON.stringify(updatedUser));
      return await getTimetrackerYearProjects(setWebTrackerProjects);
    }

    const updatedUserInfo = {
      ...userInfo,
      yearProjects: yearProjects,
    };

    localStorage.setItem(LOCAL_STORAGE_VARIABLES.TIMETRACKER_USER, JSON.stringify(updatedUserInfo));

    setWebTrackerProjects(yearProjects);
  } catch (error) {
    console.log(error);
    setWebTrackerProjects(userInfo.yearProjects);
  }
};
