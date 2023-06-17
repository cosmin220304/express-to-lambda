import fs from "fs";

export function addHandler(
  filePath: string,
  isCommonJs: boolean
) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return reject(err);

      const exportString = isCommonJs
        ? `\r\nexports.handler = require("express-to-lambda").adapter(app)`
        : `\r\nexport const handler = (import "express-to-lambda").adapter(app)`;

      fs.writeFile(
        filePath,
        data.concat(exportString),
        "utf8",
        (err) => {
          if (err) return reject(err);
          resolve(undefined);
        }
      );
    });
  });
}
