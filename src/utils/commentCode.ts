import fs from "fs";

export function commentCode(
  filePath: string,
  regex: RegExp
) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return reject(err);

      const commentedData = data.replace(regex, (match) =>
        match
          .split("\n")
          .map((line) => `// ${line}`)
          .join("\n")
      );

      fs.writeFile(
        filePath,
        commentedData,
        "utf8",
        (err) => {
          if (err) return reject(err);
          resolve(undefined);
        }
      );
    });
  });
}
