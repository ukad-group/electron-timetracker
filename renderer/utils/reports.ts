import next from "next/types";

export type ReportActivity = {
  id: number;
  from: string;
  to: string;
  duration: number;
  project?: string;
  activity?: string;
  description?: string;
  isBreak?: boolean;
  isRightTime?: boolean;
};
export type ReportAndNotes = [Array<Partial<ReportActivity>>, string];

export function parseReport(fileContent: string) {
  if (!fileContent) return [];

  let reportComments = "\n";
  let reportCount = 0;
  const timeRegex =
    /^[0-9]+:[0-9]+[\ \t]-[\ \t]*$|^[0-9]+:[0-9]+[\ \t]-[\ \t].*/;
  const lines = fileContent.split("\n").filter(Boolean);
  const reportItems: Array<Partial<ReportActivity>> = [];
  const reportAndNotes: ReportAndNotes = [reportItems, reportComments];

  for (const [i, line] of lines.entries()) {
    if (timeRegex.test(line.slice(0, 8))) {
      const fields = parseReportFields(line);
      if (fields === null) return null;
      reportItems.push({
        id: reportCount,
        ...fields,
      });
      if (reportCount > 0) {
        reportItems[reportCount - 1].to = fields.from;
      }

      reportCount++;
    } else {
      reportComments += line + "\n";
    }
  }
  reportAndNotes[1] = reportComments;

  if (reportItems[reportItems.length - 1].isBreak) {
    reportItems.pop();
  } else {
    reportItems[reportItems.length - 1].to = "23:59";
  }

  for (const item of reportItems) {
    item.duration = calcDurationBetweenTimes(item.from, item.to);
  }

  return reportAndNotes as ReportAndNotes;
}

function parseReportFields(line: string) {
  const [from, ...fields] = line
    .replace(/�/g, "-")
    .trim()
    .split(/[\ \t]-[\ \t]/);

  if (!from) return null;
  const fromTime = timeParsing(from);

  if (!fields[0]) {
    fields[0] = "!";
    return {
      from: fromTime.time,
      activity: fields[0],
      isBreak: true,
      isRightTime: fromTime.isRightTime,
    };
  }

  if (fields[0]?.startsWith("!")) {
    return {
      from: fromTime.time,
      activity: fields[0],
      isBreak: true,
      isRightTime: fromTime.isRightTime,
    };
  }
  if (fields.length === 1) {
    const [project] = fields;
    return {
      from: fromTime.time,
      project,
      isRightTime: fromTime.isRightTime,
    };
  }
  if (fields.length === 2) {
    const [project, description] = fields;
    return {
      from: fromTime.time,
      project,
      description,
      isRightTime: fromTime.isRightTime,
    };
  }
  if (fields.length === 3) {
    const [project, activity, description] = fields;
    return {
      from: fromTime.time,
      project,
      activity,
      description,
      isRightTime: fromTime.isRightTime,
    };
  }
}

function timeParsing(time: string) {
  const timeRegex = /^[0-9]+:[0-9]+/;
  const strictRegex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
  let isRightTime = true;

  time = timeRegex.exec(time)[0];

  if (!strictRegex.test(time)) {
    const [hours, minutes] = time.split(":");
    if (minutes.length < 2) {
      time = `${hours}:${minutes}0`;
    }
    if (hours.length < 2) {
      time = `0${hours}:${minutes}`;
    }
    if (hours.length < 2 && minutes.length < 2) {
      time = `0${hours}:${minutes}0`;
    }
  }

  if (Number(time.slice(0, 2)) > 23) {
    isRightTime = false;
  }
  if (Number(time.slice(3, 5)) > 59) {
    isRightTime = false;
  }
  return { time, isRightTime };
}

export function serializeReport(activities: Array<Partial<ReportActivity>>) {
  let report = "";
  for (const [i, activity] of activities.entries()) {
    const parts: Array<string> = [activity.from];

    if (!activity.isBreak) {
      parts.push(activity.project);
    }

    if (activity.activity) {
      parts.push(activity.activity);
    }

    if (activity.description) {
      parts.push(activity.description);
    }

    report += `${parts.join(" - ")}\n`;

    const nextActivity = activities[i + 1];
    if (!nextActivity || nextActivity.from !== activity.to) {
      report += `${activity.to} - !\n`;
    }
  }
  return report;
}

function parseIntOrZero(value: string) {
  return parseInt(value, 10) || 0;
}

export function calcDurationBetweenTimes(from: string, to: string): number {
  if (from == undefined || to == undefined) {
    return null;
  }
  const startParts = from.split(":");
  const endParts = to.split(":");

  const startHours = parseIntOrZero(startParts[0]);
  const startMinutes = parseIntOrZero(startParts[1]);

  const endHours = parseIntOrZero(endParts[0]);
  const endMinutes = parseIntOrZero(endParts[1]);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const totalMinutes = endTotalMinutes - startTotalMinutes;

  const milliseconds = totalMinutes * 60 * 1000;

  return milliseconds;
}

export function formatDuration(ms: number): string {
  const minutes = ms / 1000 / 60;
  const hours = minutes / 60;

  if (Math.abs(hours) < 1) {
    const minutes = Math.round(ms / 1000 / 60);
    return `${minutes}m`;
  } else {
    return `${Math.floor(hours * 10) / 10}h`;
  }
}
export function checkIntersection(previousTo: string, currentFrom: string) {
  const [hoursTo, minutesTo] = previousTo.split(":");
  const [hoursFrom, minutesFrom] = currentFrom.split(":");
  const toInMinutes = Number(hoursTo) * 60 + Number(minutesTo);
  const fromInMinutes = Number(hoursFrom) * 60 + Number(minutesFrom);
  return fromInMinutes < toInMinutes;
}
