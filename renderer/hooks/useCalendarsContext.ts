import { useContext } from 'react';
import CalendarsContext from "../context/calendars";

function useCalendarsContext() {
  return useContext(CalendarsContext);
}

export default useCalendarsContext;