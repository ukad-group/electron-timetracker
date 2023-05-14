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

export function parseReport(fileContent: string) {
  if (!fileContent) return [];

  const lines = fileContent.split("\n").filter(Boolean);
  const reportItems: Array<Partial<ReportActivity>> = [];

  for (const [i, line] of lines.entries()) {
    const [from, ...fields] = line.split(" - ");

    if (!from || !fields.length) return null;

    if (fields[0]?.startsWith("!")) {
      reportItems.push({
        id: i,
        from,
        activity: fields[0],
        isBreak: true,
      });
    } else {
      const [project, activity, description] = fields;
      reportItems.push({
        id: i,
        from,
        project,
        activity,
        description,
      });
    }
    if (i > 0) {
      reportItems[i - 1].to = from;
    }
  }

  if (reportItems[reportItems.length - 1].isBreak) {
    reportItems.pop();
  } else {
    reportItems[reportItems.length - 1].to = "23:59";
  }

  for (const item of reportItems) {
    item.duration = countHoursBetweenTimes(item.from, item.to);
  }

  return reportItems as Array<ReportActivity>;
}

export function countHoursBetweenTimes(from: string, to: string): number {
  const startParts = from.split(":");
  const endParts = to.split(":");

  const startHours = parseInt(startParts[0], 10);
  const startMinutes = parseInt(startParts[1], 10);

  const endHours = parseInt(endParts[0], 10);
  const endMinutes = parseInt(endParts[1], 10);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const totalHours = Math.abs(endTotalMinutes - startTotalMinutes) / 60;

  return totalHours;
}
