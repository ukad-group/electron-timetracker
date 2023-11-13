import React, { useEffect, useState } from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import Button from "./ui/Button";
import { useRouter } from "next/router";
import Loader from "./ui/Loader";

const TimetrackerWebsiteConnection = () => {
  const router = useRouter();
  const [loggedUser, setLoggedUser] = useState(
    JSON.parse(localStorage.getItem("timetracker-user"))
  );
  const [holidays, setHolidays] = useState([]);
  const [showholidays, setShowHolidays] = useState(false);
  const [vacationsSickDays, setVacationsSickDays] = useState([]);
  const [showVacationsSickDays, setShowVacationsSickDays] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showProjects, setShowProjects] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignInButton = async () => {
    global.ipcRenderer.send("azure:login-base");
  };

  const handleSignOutButton = () => {
    setHolidays([]);
    setVacationsSickDays([]);
    setProjects([]);

    setShowProjects(false);
    setShowVacationsSickDays(false);
    setShowHolidays(false);

    localStorage.removeItem("timetracker-user");
    setLoggedUser(null);
  };

  const handleShowHolidays = () => {
    setShowProjects(false);
    setShowVacationsSickDays(false);
    setShowHolidays(true);
  };

  const handleShowSickVac = () => {
    setShowHolidays(false);
    setShowProjects(false);
    setShowVacationsSickDays(true);
  };

  const handleShowProjects = () => {
    setShowHolidays(false);
    setShowVacationsSickDays(false);
    setShowProjects(true);
  };

  const loadUserInfo = async () => {
    setLoading(true);
    document.body.style.overflow = "hidden"; // remove scrolling

    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");
    const userPromises = [];

    try {
      const userCreds = await global.ipcRenderer.invoke(
        "timetracker:get-user-info-token",
        authorizationCode
      );

      const profilePromise = global.ipcRenderer.invoke(
        "office365:get-profile-info",
        userCreds.access_token
      );

      const TTCookiePromise = global.ipcRenderer.invoke(
        "timetracker:login",
        userCreds?.id_token
      );

      userPromises.push(...[profilePromise, TTCookiePromise]);

      const userFetchedData = await Promise.all(userPromises);
      const userInfo = userFetchedData[0];
      const timetrackerCookie = userFetchedData[1];

      const timetrackerUserInfo = {
        name: userInfo?.displayName || "",
        email: userInfo?.userPrincipalName || userInfo?.mail || "",
        TTCookie: timetrackerCookie,
      };

      localStorage.setItem(
        "timetracker-user",
        JSON.stringify(timetrackerUserInfo)
      );

      global.ipcRenderer.send("azure:login-additional");
    } catch (error) {
      console.log(error);
      alert(error);
      setLoading(false);
      document.body.removeAttribute("style");
    }
  };

  const loadPlannerInfo = async () => {
    setLoading(true);
    document.body.style.overflow = "hidden";

    const params = new URLSearchParams(window.location.search);
    const authorizationCode = params.get("code");
    const userPromises = [];

    try {
      const plannerCreds = await global.ipcRenderer.invoke(
        "timetracker:get-planner-token",
        authorizationCode
      );

      const userInfo = JSON.parse(localStorage.getItem("timetracker-user"));
      userInfo.accessToken = plannerCreds?.access_token;
      userInfo.refreshToken = plannerCreds?.refresh_token;

      const holidaysPromise = global.ipcRenderer.invoke(
        "timetracker:get-holidays",
        plannerCreds?.access_token
      );

      const userEmail = userInfo.email;
      const vacationsPromise = global.ipcRenderer.invoke(
        "timetracker:get-vacations",
        plannerCreds?.access_token,
        userEmail
      );

      const timetrackerCookie = userInfo.TTCookie;
      const timtrackerProjectsPromise = global.ipcRenderer.invoke(
        "timetracker:get-projects",
        timetrackerCookie
      );

      userPromises.push(
        ...[holidaysPromise, vacationsPromise, timtrackerProjectsPromise]
      );

      const userFetchedData = await Promise.all(userPromises);

      const userHolidays = userFetchedData[0];
      setHolidays(userHolidays);
      userInfo.holidays = userHolidays;

      const userVacations = userFetchedData[1].periods;
      setVacationsSickDays(userVacations);
      userInfo.vacationsSickdays = userVacations;

      const timtrackerYearProjects = userFetchedData[2];
      setProjects(timtrackerYearProjects);
      userInfo.yearProjects = timtrackerYearProjects;

      localStorage.setItem("timetracker-user", JSON.stringify(userInfo));
      setLoggedUser(userInfo);
      setLoading(false);
      router.push("/settings");
      document.body.removeAttribute("style"); // restore scrolling
    } catch (error) {
      console.log(error);
      alert(error);
      setLoading(false);
      document.body.removeAttribute("style");
    }
  };

  useEffect(() => {
    if (loggedUser) {
      setHolidays(loggedUser?.holidays);
      setVacationsSickDays(loggedUser?.vacationsSickdays);
      setProjects(loggedUser?.yearProjects);
    }

    const searchParams = window.location.search;

    if (
      searchParams.includes("code") &&
      searchParams.includes("state=azure-base") &&
      !searchParams.includes("error")
    ) {
      (async () => loadUserInfo())();
    } else if (
      searchParams.includes("code") &&
      searchParams.includes("state=azure-additional") &&
      !searchParams.includes("error")
    ) {
      (async () => loadPlannerInfo())();
    } else if (searchParams.includes("error")) {
      console.log("There are some problems with authorize");
      console.log(searchParams);
    }
  }, []);

  if (loading) {
    return (
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 overflow-hidden">
        <div className="absolute top-1/2 left-1/2">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-start justify-between gap-2 border rounded-lg shadow dark:border-dark-form-border">
      <div className="flex justify-between items-center w-full ">
        <span className="font-medium dark:text-dark-heading">
          Timetracker website
        </span>

        {!loggedUser && (
          <Button
            text="Add account"
            callback={handleSignInButton}
            type="button"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-4 w-full">
        {!loggedUser && (
          <div className="text-yellow-600 inline-flex  items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-400/20">
            No one user authorized
          </div>
        )}

        {loggedUser && (
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-4 items-center">
              <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300 text-blue-900 dark:text-blue-400 dark:bg-blue-400/20">
                {loggedUser.email}
              </div>
              <div
                onClick={handleSignOutButton}
                className="cursor-pointer bg-gray-400 hover:bg-gray-500 transition duration-300 inline-flex gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white dark:text-dark-heading dark:bg-dark-button-back-gray dark:hover:bg-dark-button-gray-hover"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 fill-white dark:fill-dark-heading" />
                Sign Out
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-dark-main">
        After connection, you will be able to see a company holidays, your
        vacations and sickdays and all active projects for the last year.
      </p>
      <div className="flex gap-x-2">
        {holidays?.length > 0 && (
          <Button text="Show holidays" callback={handleShowHolidays} />
        )}
        {vacationsSickDays?.length > 0 && (
          <Button text="Show vacation/sickdays" callback={handleShowSickVac} />
        )}
        {projects?.length > 0 && (
          <Button text="Show active projects" callback={handleShowProjects} />
        )}
      </div>
      <div>
        {showholidays &&
          holidays.map((item) => (
            <div
              className="flex items-center gap-2 text-sm text-gray-900 dark:text-dark-main"
              key={item.id}
            >
              <p>{item.description}</p>
              <p>{new Date(item.dateFrom).toLocaleDateString("en-GB")}</p>
            </div>
          ))}
        {showVacationsSickDays &&
          vacationsSickDays.map((item) => (
            <div
              className="flex items-center gap-2 text-sm text-gray-900 dark:text-dark-main"
              key={item.id}
            >
              <p>{item.description}</p>
              <p>{new Date(item.dateFrom).toLocaleDateString("en-GB")}</p>
              <p>{item?.quantity}h</p>
            </div>
          ))}
        {showProjects && (
          <div className="grid grid-cols-6 gap-2">
            {projects.map((item) => (
              <p
                className="text-xs col-span-1 text-gray-900 dark:text-dark-main"
                key={item}
              >
                {item}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimetrackerWebsiteConnection;
