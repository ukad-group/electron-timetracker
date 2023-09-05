const calendarID = '2b2b103aafa57aeffd8576629cc6ed2bfc74dde0606a4833c2ecc26c8ae3e48a@group.calendar.google.com';
const apiKey = 'AIzaSyCGxzHXUHJAr8FuBDpdrhKVi_iDFYMIjt0';
const path = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events`;

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