import ApiCalendar from "react-google-calendar-api";
import Button from "../ui/Button";
import { useGoogleCalendarStore } from "../../store/googleCalendarStore";

const config = {
  clientId:
    "717524073110-hbh5ei25iuhb7mvucqgjr92maivpt7df.apps.googleusercontent.com",
  apiKey: "AIzaSyC8SpmdGCMoNOkJM3fc85PAyMiFbxOOUAM",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

const { handleAuthClick, handleSignoutClick, listEvents, setCalendar } =
  new ApiCalendar(config);

function GoogleCalendarAuth() {
  const { googleEvents, setGoogleEvents, isLogged, setIsLogged } =
    useGoogleCalendarStore();
  const currentDate = new Date();

  const signInHandler = () => {
    handleAuthClick().then(() => {
      setIsLogged(true);
      getEvents();
    });
  };

  const signOutHandler = () => {
    setIsLogged(false);
    setGoogleEvents([]);
    handleSignoutClick();
  };

  const getEventsList = () => {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59);

    return listEvents({
      showDeleted: false,
      singleEvents: true,
      orderBy: "startTime",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
    }).then(({ result }) => {
      return result?.items;
    });
  };

  const getEvents = () => {
    getEventsList()
      .then((items) => setGoogleEvents(items))
      .catch((e) => console.log(e));
  };

  // const buildEventsList = () => {
  //   return googleEvents.map((event) => {
  //     const { id, start, end, summary, htmlLink } = event;
  //     const from = setDateTimeObj(start.dateTime);
  //     const to = setDateTimeObj(end.dateTime);

  //     return (
  //       <li
  //         id={id}
  //         key={id}
  //         className="text-m font-medium text-gray-900 px-4 py-2 flex justify-between border items-stretch"
  //       >
  //         <div className="w-full justify-start">
  //           {summary ? summary : "No title"}
  //           <span className="block text-sm text-gray-500">
  //             {from.date} {from.time} - {to.time}
  //           </span>
  //         </div>
  //         <a
  //           href={htmlLink}
  //           target="_blank"
  //           className="flex w-full justify-end align-middle text-sm text-gray-500 pl-10"
  //         >
  //           Go to event
  //         </a>
  //       </li>
  //     );
  //   });
  // };

  // const setDateTimeObj = (date) => {
  //   return {
  //     date: new Date(date).toLocaleDateString(),
  //     time: new Date(date).toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     }),
  //   };
  // };

  return (
    <div className="flex-shrink-0">
      {isLogged ? (
        <Button text="Sign Out" callback={signOutHandler} type="button" />
      ) : (
        <Button text="Sign In" callback={signInHandler} type="button" />
      )}
    </div>
  );
}

export default GoogleCalendarAuth;
