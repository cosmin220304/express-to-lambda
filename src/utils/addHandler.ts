import fs from "fs";
// @ts-ignore
import { handler } from "./handler.js";

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
        data.concat(exportString + handler.toString()),
        "utf8",
        (err) => {
          if (err) return reject(err);
          resolve(undefined);
        }
      );
    });
  });
}
