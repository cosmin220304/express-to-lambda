import { addHandler } from "./utils/addHandler";
import { commentCode } from "./utils/commentCode";
import { findFilesWithString } from "./utils/findFilesWithString";
import { checkIfFolder } from "./utils/isFolder";
import { appListenerRegex } from "./utils/regex";

function isCommonJs(targetDirectory: string): boolean {
  return !findFilesWithString(
    targetDirectory,
    `"type": "module"`
  ).at(0);
}

function getAppIndex(targetDirectory: string): string {
  const appIndex = findFilesWithString(
    targetDirectory,
    "express()"
  ).at(0);

  if (!appIndex) {
    throw new Error("Express app not found");
  }
  return appIndex;
}

async function convert(targetDirectory: string) {
  await checkIfFolder(targetDirectory);
  const appIndex = getAppIndex(targetDirectory);
  await commentCode(appIndex, appListenerRegex);
  await addHandler(appIndex, isCommonJs(targetDirectory));
}

export { convert };
