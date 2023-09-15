import { createContext, useState } from 'react';

const context: any = {};
const CalendarsContext = createContext(context);

function Provider({ children }) {
  const [calendars, setCalendars] = useState({});

  const setGoogleCalendarEvents = async (google) => {
    setCalendars({...calendars, google});
  };

  const value: any = {
    calendars,
    setGoogleCalendarEvents
  };

  return (
    <CalendarsContext.Provider value={value}>
      {children}
    </CalendarsContext.Provider>
  );
}

export { Provider };
export default CalendarsContext;
