import fs from "fs";
import { HANDLER } from "./handler";

export function addHandler(
  filePath: string,
  isCommonJs: boolean
) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return reject(err);

      const exportString = isCommonJs
        ? "\r\nexports.handler = "
        : "\r\nexport const handler = ";

      fs.writeFile(
        filePath,
        data.concat(exportString + HANDLER),
        "utf8",
        (err) => {
          if (err) return reject(err);
          resolve(undefined);
        }
      );
    });
  });
}
