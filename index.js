#! /usr/bin/env node

import { convert } from "./lib/cjs/index.js";

const folder = process.argv.at(2);

if (process.argv.length !== 3) {
  console.log(
    `Run the command as:
  npx express-to-lambda <root folder>`
  );
  process.exit(1);
}

convert(folder)
  .then(() =>
    console.log(
      "Successfully converted express application!"
    )
  )
  .catch((err) => {
    console.log("Error:", err);
    process.exit(1);
  });
