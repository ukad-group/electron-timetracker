import fs from "fs";

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
