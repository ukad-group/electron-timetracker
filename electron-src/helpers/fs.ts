import fs from "fs";
import path from "path";

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
  queries: string[],
  year: string
) {
  const initialReportsArr: Report[] = [];
  const yearFolders = fs.readdirSync(directory);
  const currentYearFolder = yearFolders.find(
    (folderName) => folderName === year
  );

  if (!currentYearFolder) return [];

  const currentYearPath = `${directory}/${currentYearFolder}`;

  const filledReportsArr = searchFilesWithSubfolders(
    currentYearPath,
    queries,
    initialReportsArr
  );

  return filledReportsArr;
}

function isTimereportNameValid(filename: string) {
  return /^timereport - \d{8}$/.test(filename);
}

function searchFilesWithSubfolders(
  currentYearFolder: string,
  queries: string[],
  initialReportsArr: Report[]
) {
  try {
    const files = fs.readdirSync(currentYearFolder);

    files.forEach((file) => {
      const filePath = path.join(currentYearFolder, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        searchFilesWithSubfolders(filePath, queries, initialReportsArr);
      } else if (
        isTimereportNameValid(file) &&
        queries.some((query) => file.includes(query))
      ) {
        initialReportsArr.push({
          data: fs.readFileSync(filePath, "utf8"),
          reportDate: filePath.split(" - ")[1],
        });
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }

  return initialReportsArr;
}
