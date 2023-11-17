import { useEffect, useState, Dispatch, SetStateAction } from "react";
// import { useGoogleCalendarStore } from "../../store/googleCalendarStore";
// import {
//   getGoogleEvents,
//   updateGoogleCredentials,
// } from "../../API/googleCalendarAPI";
// import { checkAlreadyAddedGoogleEvents } from "../../utils/utils";
// import Loader from "../ui/Loader";

// type GoogleCalendarShowCheckboxProps = {
//   setShowGoogleEvents: Dispatch<SetStateAction<Boolean>>;
// };

// export default function GoogleCalendarShowCheckbox({
//   setShowGoogleEvents,
// }: GoogleCalendarShowCheckboxProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const { googleEvents, setGoogleEvents } = useGoogleCalendarStore();

//   const loadGoogleEvents = async (gToken: string) => {
//     try {
//       setIsLoading(true);
//       const data = await getGoogleEvents(gToken);

//       // detect expired token
//       if (data?.error && data?.error?.code === 401) {
//         const refreshToken = localStorage.getItem("googleRefreshToken");
//         const updatedCredentials = await updateGoogleCredentials(refreshToken);
//         const newAccessToken = updatedCredentials?.access_token;
//         localStorage.setItem("googleAccessToken", newAccessToken);
//         loadGoogleEvents(newAccessToken);
//         return;
//       }

//       const storedGoogleEvents = JSON.parse(
//         localStorage.getItem("googleEvents")
//       );

//       if (storedGoogleEvents === null) {
//         localStorage.setItem("googleEvents", JSON.stringify(data?.items));
//         setGoogleEvents(data?.items);
//         return;
//       }

//       const checkedGoogleEvents = checkAlreadyAddedGoogleEvents(
//         storedGoogleEvents,
//         data?.items
//       );

//       localStorage.setItem("googleEvents", JSON.stringify(checkedGoogleEvents));
//       setGoogleEvents(checkedGoogleEvents);
//     } catch (error) {
//       setIsError(true);
//       console.error(error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const googleAccessToken = localStorage.getItem("googleAccessToken");

//     if (googleAccessToken) {
//       loadGoogleEvents(googleAccessToken);

//       global.ipcRenderer.on("window-restored", () => {
//         loadGoogleEvents(googleAccessToken);
//       });
//     }

//     return () => {
//       global.ipcRenderer.removeAllListeners("window-restored");
//     };
//   }, []);

//   const resetGoogleEventsHandle = () => {
//     const resetedGoogleEvents = googleEvents.map((gEvent) => {
//       gEvent.isAdded = false;

//       return gEvent;
//     });

//     localStorage.setItem("googleEvents", JSON.stringify(resetedGoogleEvents));
//     setGoogleEvents(resetedGoogleEvents);
//     setShowGoogleEvents(false);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center pr-14">
//         <Loader />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <p className="text-sm text-gray-500 dark:text-slate-400">
//         Something went wrong while getting events
//       </p>
//     );
//   }

//   if (googleEvents?.length === 0) {
//     return (
//       <p className="text-sm text-gray-500 dark:text-slate-400">
//         You don't have events for today
//       </p>
//     );
//   }

//   if (
//     googleEvents?.length > 0 &&
//     googleEvents.every((gEvent) => gEvent?.isAdded)
//   ) {
//     return (
//       <>
//         <p className="text-sm text-gray-500 dark:text-slate-400">
//           You've already added all events for today
//         </p>
//         <button
//           onClick={resetGoogleEventsHandle}
//           className="text-gray-500 inline-flex items-center justify-center px-2 py-1 text-xs border rounded-md shadow-sm hover:bg-gray-100 dark:text-slate-400"
//         >
//           reset
//         </button>
//       </>
//     );
//   }

//   if (googleEvents?.length > 0) {
//     return (
//       <>
//         <label
//           className="text-sm text-gray-500 dark:text-slate-400"
//           htmlFor="google-calendar"
//         >
//           Show Google calendar events
//         </label>
//         <input
//           onClick={() => setShowGoogleEvents((prev) => !prev)}
//           id="google-calendar"
//           type="checkbox"
//         ></input>
//       </>
//     );
//   }
// }
