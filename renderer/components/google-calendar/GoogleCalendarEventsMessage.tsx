import { useEffect, useState, Dispatch, SetStateAction } from "react";
// import { useGoogleCalendarStore } from "../../store/googleCalendarStore";
// import {
//   getGoogleEvents,
//   updateGoogleCredentials,
// } from "../../API/googleCalendarAPI";
// import { checkAlreadyAddedGoogleEvents } from "../../utils/utils";
// import Loader from "../ui/Loader";
// import { ReportActivity } from "../../utils/reports";

// type GoogleCalendarEventsMessageProps = {
//   setShowGoogleEvents: Dispatch<SetStateAction<Boolean>>;
//   formattedGoogleEvents: ReportActivity[];
// };

// export default function GoogleCalendarEventsMessage({
//   setShowGoogleEvents,
//   formattedGoogleEvents,
// }: GoogleCalendarEventsMessageProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const { googleEvents, setGoogleEvents } = useGoogleCalendarStore();

//   const loadGoogleEvents = async (
//     accessToken: string,
//     refreshToken: string,
//     index: number
//   ) => {
//     try {
//       setIsLoading(true);
//       const data = await getGoogleEvents(accessToken);

//       // detect expired token
//       if (data?.error && data?.error?.code === 401) {
//         const updatedCredentials = await updateGoogleCredentials(refreshToken);
//         const newAccessToken = updatedCredentials?.access_token;
//         const usersLs = JSON.parse(localStorage.getItem("googleUsers"));
//         usersLs[index].googleAccessToken = newAccessToken;
//         localStorage.setItem("googleUsers", JSON.stringify(usersLs));
//         return "expired-token";
//       }

//       return data?.items;
//     } catch (error) {
//       setIsError(true);
//       console.error(error);
//       return [];
//     }
//   };

//   const loadGoogleEventsFromAllUsers = async (users) => {
//     const userPromises = users.map((user, i) =>
//       loadGoogleEvents(user.googleAccessToken, user.googleRefreshToken, i)
//     );
//     const userEvents = await Promise.all(userPromises);

//     if (userEvents.includes("expired-token")) {
//       const updatedUsersLs = JSON.parse(localStorage.getItem("googleUsers"));
//       loadGoogleEventsFromAllUsers(updatedUsersLs);
//       return;
//     }

//     const flattenedEvents = userEvents.flat();
//     const storedGoogleEvents = JSON.parse(localStorage.getItem("googleEvents"));

//     if (storedGoogleEvents === null) {
//       localStorage.setItem("googleEvents", JSON.stringify(flattenedEvents));
//       setShowGoogleEvents(true);
//       setGoogleEvents(flattenedEvents);
//       setIsLoading(false);
//       return;
//     }

//     const checkedGoogleEvents = checkAlreadyAddedGoogleEvents(
//       storedGoogleEvents,
//       flattenedEvents
//     ).filter((gEvent) => gEvent?.start?.dateTime && gEvent?.end?.dateTime);

//     localStorage.setItem("googleEvents", JSON.stringify(checkedGoogleEvents));
//     setGoogleEvents(checkedGoogleEvents);
//     setShowGoogleEvents(true);
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     const googleUsers = JSON.parse(localStorage.getItem("googleUsers"));
//     const showGoogleEventsLs = localStorage.getItem("showGoogleEvents");

//     if (googleUsers && showGoogleEventsLs === "true") {
//       loadGoogleEventsFromAllUsers(googleUsers);

//       global.ipcRenderer.on("window-focused", () => {
//         loadGoogleEventsFromAllUsers(googleUsers);
//       });
//     }

//     return () => {
//       global.ipcRenderer.removeAllListeners("window-focused");
//     };
//   }, []);

//   // const resetGoogleEventsHandle = () => {
//   //   const resetedGoogleEvents = googleEvents.map((gEvent) => {
//   //     gEvent.isAdded = false;

//   //     return gEvent;
//   //   });

//   //   localStorage.setItem("googleEvents", JSON.stringify(resetedGoogleEvents));
//   //   setGoogleEvents(resetedGoogleEvents);
//   // };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center pr-14">
//         <Loader />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <p className="text-sm text-gray-500">
//         Something went wrong while getting events
//       </p>
//     );
//   }

//   if (googleEvents?.length === 0) {
//     return (
//       <p className="text-sm text-gray-500">You don't have events for today</p>
//     );
//   }

//   if (
//     googleEvents?.length > 0 &&
//     googleEvents.every((gEvent) => {
//       return gEvent?.isAdded || !gEvent?.start?.dateTime;
//     })
//   ) {
//     return (
//       <>
//         <p className="text-sm text-gray-500">
//           You've already added all events for today
//         </p>
//         {/* <button
//           onClick={resetGoogleEventsHandle}
//           className="text-gray-500 inline-flex items-center justify-center px-2 py-1 text-xs border rounded-md shadow-sm hover:bg-gray-100 "
//         >
//           reset
//         </button> */}
//       </>
//     );
//   }

//   if (
//     formattedGoogleEvents.length <
//       googleEvents.filter((gEvent) => !gEvent.isAdded).length &&
//     formattedGoogleEvents.length !== 0
//   ) {
//     return (
//       <p className="text-sm text-gray-500">
//         Google events are showing. Skipped{" "}
//         {googleEvents.filter((gEvent) => !gEvent.isAdded).length -
//           formattedGoogleEvents.length}{" "}
//         event(s)
//       </p>
//     );
//   }

//   if (
//     formattedGoogleEvents?.length === 0 &&
//     !googleEvents.every((gEvent) => {
//       return gEvent?.isAdded || !gEvent?.start?.dateTime;
//     })
//   ) {
//     return (
//       <>
//         <p className="text-sm text-gray-500">
//           You've skipped{" "}
//           {googleEvents.filter((gEvent) => !gEvent?.isAdded)?.length} event(s)
//         </p>
//       </>
//     );
//   }

//   if (googleEvents?.length > 0) {
//     return (
//       <>
//         <p className="text-sm text-gray-500">Google events are showing</p>
//       </>
//     );
//   }
// }
