import next from "next/types";

export type ReportActivity = {
  id: number;
  from: string;
  to: string;
  duration: number;
  project?: string;
  activity: string;
  description?: string;
  isBreak?: boolean;
};
export type ReportAndNotes = [Array<Partial<ReportActivity>>, string];

export function parseReport(fileContent: string) {
  if (!fileContent) return [];

  let reportComments = "\n";
  let reportCount = 0;
  const lines = fileContent.split("\n").filter(Boolean);
  const reportItems: Array<Partial<ReportActivity>> = [];
  const reportAndNotes: ReportAndNotes = [reportItems, reportComments];
  const timePattern = /\b(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]\b/;

  for (const [i, line] of lines.entries()) {
    if (timePattern.test(line)) {
      const [from, ...fields] = line.split(" - ");

      if (!from || !fields.length) return null;

      if (fields[0]?.startsWith("!")) {
        reportItems.push({
          id: reportCount,
          from,
          activity: fields[0],
          isBreak: true,
        });
      } else {
        const [project, activity, description] = fields;
        reportItems.push({
          id: reportCount,
          from,
          project,
          activity,
          description,
        });
      }
      if (reportCount > 0) {
        reportItems[reportCount - 1].to = from;
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

export function serializeReport(activities: Array<Partial<ReportActivity>>) {
  let report = "";
  for (const [i, activity] of activities.entries()) {
    const parts: Array<string> = [activity.from];

    if (!activity.isBreak) {
      parts.push(activity.project);
    }

    parts.push(activity.activity);

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
  // console.log("from " + from);
  // console.log("to " + to);
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
