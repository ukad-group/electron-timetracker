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

export function searchReadFile(
  directory: string,
  query: string,
  reportsArr: Report[]
) {
  try {
    const files = fs.readdirSync(directory);

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        searchReadFile(filePath, query, reportsArr);
      } else if (file.includes(query)) {
        reportsArr.push({
          data: fs.readFileSync(filePath, "utf8"),
          reportDate: filePath.split(" - ")[1],
        });
      }
    });
  } catch (err) {
    console.error("Error:", err);
  }

  return reportsArr;
}
