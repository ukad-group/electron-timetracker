import ApiCalendar from "react-google-calendar-api";

const calendarID = '2b2b103aafa57aeffd8576629cc6ed2bfc74dde0606a4833c2ecc26c8ae3e48a@group.calendar.google.com';
const apiKey = 'AIzaSyCGxzHXUHJAr8FuBDpdrhKVi_iDFYMIjt0';
const path = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events`;
const clientId = '1090272151917-8gk9mgu5bh200ggcnghmp9sau4hhqnia.apps.googleusercontent.com';
const scope = 'https://www.googleapis.com/auth/calendar';

const config = {
  clientId,
  apiKey,
  scope,
  discoveryDocs: [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
  ]
};

const { handleAuthClick, handleSignoutClick, listEvents, sign } = new ApiCalendar(config);

export const getEvents = async (callback) => {
    const gapi = await import('gapi-script').then((pack) => pack.gapi);
    function initiate() {
        gapi.client
            .init({ apiKey })
            .then(() => (gapi.client.request({ path })))
            .then(
                (response) => {
                    let events = response.result.items;
                    callback(events);
                },
                (err) => ([false, err])
            );
    }
    gapi.load('client', initiate);
}

export const signIn = () => {
  return handleAuthClick();
}

export const signOut = () => {
  return handleSignoutClick();
}

export const getEventsList = () => {
  return listEvents({
    showDeleted: false,
    orderBy: 'updated'
  }).then(({ result }) => {
    return result?.items;
  });
}

export const checkIsSignedIn = () => {
  return sign;
}