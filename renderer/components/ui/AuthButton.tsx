import ApiCalendar from "react-google-calendar-api";

// const clientId = '717524073110-hbh5ei25iuhb7mvucqgjr92maivpt7df.apps.googleusercontent.com'
// const apiKey = "AIzaSyC8SpmdGCMoNOkJM3fc85PAyMiFbxOOUAM"

const config = {
  clientId:
    "717524073110-hbh5ei25iuhb7mvucqgjr92maivpt7df.apps.googleusercontent.com",
  apiKey: "AIzaSyC8SpmdGCMoNOkJM3fc85PAyMiFbxOOUAM",
  scope: "https://www.googleapis.com/auth/calendar",
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ],
};

const { handleAuthClick } = new ApiCalendar(config);

export default function AuthButton() {
  return <button onClick={() => handleAuthClick()}>AuthButton</button>;
}
