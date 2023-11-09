type GoogleEvent = {
  created: string;
  creator: { email: string; self: boolean };
  description: string;
  end: { dateTime: string; timeZone: string };
  etag: string;
  eventType: string;
  htmlLink: URL;
  iCalUID: string;
  id: string;
  kind: string;
  organizer: { email: string; self: true };
  reminders: { useDefault: boolean };
  sequence: number;
  start: { dateTime: string; timeZone: string };
  status: string;
  summary: string;
  updated: string;
  from: { date: string; time: string };
  to: { date: string; time: string };
  isAdded?: boolean;
  project?: string;
  activity?: string;
};
export function googleCalendarEventsParsing(googleEvent:GoogleEvent, availableProjects:Array<string>){

    const { summary } = googleEvent;
    const items = summary ? summary.split(" - ") : "";

    switch (items.length) {
        case 0:
        googleEvent.description = "";
        break;
        case 1:
        googleEvent.description = items[0];
        break;
        case 2:
        if (availableProjects.includes(items[0])) {
            googleEvent.project = items[0];
            googleEvent.description = items[1];
        } else {
        googleEvent.activity = items[0];
        googleEvent.description = items[1];
        }
        break;
        case 3:
        googleEvent.project = items[0];
        googleEvent.activity = items[1];
        googleEvent.description = items[2];
        break;
        default:
        if(items){
        googleEvent.description = items.join(" - ");}
    }
    return googleEvent;

}