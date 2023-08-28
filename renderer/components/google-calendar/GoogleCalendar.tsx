import React, { useEffect, useState } from "react";
import { getEvents } from '../../API/googleCalendraAPI';

function GoogleCalendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        getEvents((events) => {
            setEvents(events);
        });
    }, []);

    const buildEventsList = () => {
        console.warn('============ EFFECT ===========', events);
        return events.map((event) => {
            const { id, summary, htmlLink } = event;
            return (
                <li id={id} key={id}  className="text-m font-medium text-gray-900 px-4 py-2 text-sm border">
                    {summary}
                    <a href={ htmlLink } target="_blank" className="text-sm text-gray-500 pl-10">Go to event</a>
                </li>
            );
        });
    };

    return (
        <div className="callendar-container">
            <ul className="callendar-list">
                { buildEventsList() }
            </ul>
        </div>
    );
}

export default GoogleCalendar;