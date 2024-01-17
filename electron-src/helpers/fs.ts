import fs from "fs";
import path from "path";
import { getDateFromFilename, getISOWeek } from "./datetime";

export function createDirByPath(path: string) {
  const parts = path.split("/");
  let currentPath = "";

  parts.forEach((part) => {
    currentPath += `${part}/`;
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
}

type Report = {
  data: string;
  reportDate: string;
};

export function searchReadFiles(
  directory: string,
  queries: { year: string; week: string }[]
) {
  const reports: Report[] = [];
  const yearFolders = fs.readdirSync(directory);

  queries.forEach(({ year, week }) => {
    const yearFolderName = year;
    const weekFolderName = `week ${week}`;

    if (!yearFolders.includes(yearFolderName)) return;

    const weekFolders = fs.readdirSync(`${directory}/${yearFolderName}`);

    if (!weekFolders.includes(weekFolderName)) return;

    const currentWeekFolder = `${directory}/${yearFolderName}/${weekFolderName}`;
    const files = fs.readdirSync(currentWeekFolder);

    files.forEach((file) => {
      const filePath = path.join(currentWeekFolder, file);
      const dateFromFilename = getDateFromFilename(file);

      if (!dateFromFilename) return;

      const weekFromFilename = getISOWeek(dateFromFilename)
        .toString()
        .padStart(2, "0");

      if (isTimereportNameValid(file) && weekFromFilename === week) {
        reports.push({
          data: fs.readFileSync(filePath, "utf8"),
          reportDate: filePath.split(" - ")[1],
        });
      }
    });
  });

  return reports;
}

function isTimereportNameValid(filename: string) {
  return /^timereport - \d{8}$/.test(filename);
}
