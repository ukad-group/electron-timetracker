import { getTimeFromEventObj, padStringToMinutes } from "@/helpers/utils/datetime-ui";
import { parseEventTitle } from "@/helpers/utils/utils";
import { calcDurationBetweenTimes } from "@/helpers/utils/reports";

export const getTotalDuration = (nonBreakActivities) => nonBreakActivities.reduce((value, activity) => value + (activity.duration ? activity.duration : 0), 0);

export const formatEvents = (events, latestProjAndAct) => {
  if (!events.length) { return []; }

  return events.map((event) => {
    const { start, end } = event;

    const startDateTime = start?.timeZone === "UTC" ? `${start?.dateTime}Z` : start?.dateTime;
    const endDateTime = end?.timeZone === "UTC" ? `${end?.dateTime}Z` : end?.dateTime;

    const from = getTimeFromEventObj(startDateTime);
    const to = getTimeFromEventObj(endDateTime);

    event = parseEventTitle(event, latestProjAndAct);

    return {
      from,
      to,
      duration: calcDurationBetweenTimes(from, to),
      project: event.project || "",
      activity: event.activity || "",
      description: event.description || "",
      isValid: true,
      calendarId: event.id
    };
  });
};

export const getActualEvents = (events, activities) => {
  if (!events.length) { return []; }

  return events.filter((event) => {
    const { end } = event;
    const endDateTime = end?.timeZone === "UTC" ? `${end?.dateTime}Z` : end?.dateTime;
    const to = getTimeFromEventObj(endDateTime);
    const isOverlapped = activities.some((activity) => padStringToMinutes(activity.to) >= padStringToMinutes(to));

    if (event?.start?.dateTime && event?.end?.dateTime && !isOverlapped) {
      return event;
    }
  });
};
