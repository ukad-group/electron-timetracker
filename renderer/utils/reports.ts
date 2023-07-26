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
};
export type ReportAndNotes = [Array<Partial<ReportActivity>>, string];

export function parseReport(fileContent: string) {
  if (!fileContent) return [];

  let reportComments = "\n";
  let reportCount = 0;
  const timeRegex = /^[0-9]+:[0-9]+/;
  const lines = fileContent.split("\n").filter(Boolean);
  const reportItems: Array<Partial<ReportActivity>> = [];
  const reportAndNotes: ReportAndNotes = [reportItems, reportComments];

  for (const [i, line] of lines.entries()) {
    if (timeRegex.test(line.slice(0, 5))) {
      const fields = parseReportFields(line.replace(/�/g, "-"));
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
  const timeRegex = /^[0-9]+:[0-9]+/;
  const [from, ...fields] = line.split(" - ");

  if (!from) return null;
  let fromTime = timeRegex.exec(from)[0];

  if (Number(fromTime.slice(0, 2)) > 23) {
    fromTime = "23:59";
  }
  if (Number(fromTime.slice(3, 5)) > 59) {
    fromTime = fromTime.slice(0, -2) + "59";
  }

  if (!fields[0]) {
    fields[0] = "!";
    return {
      from: fromTime,
      activity: fields[0],
      isBreak: true,
    };
  }

  if (fields[0]?.startsWith("!")) {
    return {
      from: fromTime,
      activity: fields[0],
      isBreak: true,
    };
  }
  if (fields.length === 1) {
    const [project] = fields;
    return {
      from: fromTime,
      project,
    };
  }
  if (fields.length === 2) {
    const [project, description] = fields;
    return {
      from: fromTime,
      project,
      description,
    };
  }
  if (fields.length === 3) {
    const [project, activity, description] = fields;
    return {
      from: fromTime,
      project,
      activity,
      description,
    };
  }
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
