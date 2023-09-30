import fs from "fs";
import { getPathFromDate, calcDurationBetweenTimes } from "./datetime";
export type Activity = {
  acti: string;
  desc: string;
  dur: number | null;
};

export type AllActivities = Record<string, Activity[]>;

export function parseReportsInfo(
  reportsFolder: string,
  date: Date
): AllActivities {
  const parsedProjects: AllActivities = {
    internal: [],
    hr: [],
  };

  let currentDate = new Date(date);

  for (let i = 0; i < 31; i++) {
    currentDate.setDate(currentDate.getDate() - 1);
    const timereportPath = getPathFromDate(currentDate, reportsFolder);
    const timeRegex = /^[0-9]+:[0-9]+/;
    try {
      const lines = fs.readFileSync(timereportPath, "utf8").split("\n");

      for (let j = 0; j < lines.length; j++) {
        if (!timeRegex.test(lines[j])) continue;
        const parts = lines[j].split(" - ");
        const from = parts[0]?.trim();
        const to = lines[j + 1]?.split(" - ")[0];
        const project = parts[1]?.trim();
        const activity = parts[2]?.trim();
        const description = parts[3]?.trim();

        if (!project || project?.startsWith("!")) continue;

        if (!parsedProjects.hasOwnProperty(project) && parts.length === 2) {
          parsedProjects[project] = [
            {
              acti: "",
              desc: "",
              dur: to ? calcDurationBetweenTimes(from, to) : 0,
            },
          ];
          continue;
        }

        if (!parsedProjects.hasOwnProperty(project) && parts.length === 3) {
          parsedProjects[project] = [
            {
              acti: "",
              desc: activity,
              dur: to ? calcDurationBetweenTimes(from, to) : 0,
            },
          ];
          continue;
        }
        if (!parsedProjects.hasOwnProperty(project) && parts.length === 4) {
          parsedProjects[project] = [
            {
              acti: activity,
              desc: description,
              dur: to ? calcDurationBetweenTimes(from, to) : 0,
            },
          ];
          continue;
        }
        const newctivity: Activity = {
          acti: "",
          desc: "",
          dur: to ? calcDurationBetweenTimes(from, to) : 0,
        };
        if (parts.length === 3) {
          newctivity.desc = activity;
        }

        if (parts.length === 4) {
          newctivity.acti = activity;
          newctivity.desc = description;
        }

        parsedProjects[project].push(newctivity);
      }
    } catch (e) {
      continue;
    }
  }

  return parsedProjects;
}
