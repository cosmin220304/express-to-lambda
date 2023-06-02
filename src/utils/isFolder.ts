import fs from "fs";

export function checkIfFolder(directory: string) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(directory)) {
      reject(`${directory} not found!`);
    }
    fs.lstat(directory, (err, stats) => {
      if (err) return reject(err);
      if (stats.isDirectory()) return resolve(undefined);
      reject(`${directory} is not a valid directory!`);
    });
  });
}
