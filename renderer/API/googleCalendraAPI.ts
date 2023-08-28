const calendarID = ''; // <Calendar ID here>
const apiKey = ''; // <API key here>
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