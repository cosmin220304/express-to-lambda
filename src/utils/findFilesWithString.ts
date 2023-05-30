import fs from "fs";
import path from "path";

export function findFilesWithString(
  targetDirectory: string,
  stringToSearch: string
) {
  const foundFiles: string[] = [];
  const files = fs.readdirSync(targetDirectory);

  for (const file of files) {
    const filePath = path.join(targetDirectory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory() && file !== "node_modules") {
      foundFiles.push(
        ...findFilesWithString(filePath, stringToSearch)
      );
    }

    if (stats.isFile()) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      if (fileContent.includes(stringToSearch)) {
        foundFiles.push(filePath);
      }
    }
  }

  return foundFiles;
}
