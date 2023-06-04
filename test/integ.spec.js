const { execSync } = require("child_process");
const { convert } = require("../lib/cjs/index");
const path = require("path");
const { event } = require("./dummyEvent");
const { describe } = require("node:test");

beforeAll(async () => {
  execSync(
    `cp -R ${getOriginalTargetDirectory()} ${__dirname}`
  );
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await convert(getCopyTargetDirectory());
});

describe("Test converter", () => {
  test("should return 200 for GET /", async () => {
    // Prepare
    const { handler } = require(getCopyTargetDirectory());

    // Act
    const response = await handler(event);

    // Assert
    expect(response.statusCode).toBe(200);
  });

  test("should return 404 for POST /", async () => {
    // Prepare
    const { handler } = require(getCopyTargetDirectory());
    let badEvent = {
      ...event,
      httpMethod: "POST",
    };

    // Act
    const response = await handler(badEvent);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(response.body).toBe("Path not found!");
  });

  test("should return 404 for invalid event", async () => {
    // Prepare
    const { handler } = require(getCopyTargetDirectory());
    let badEvent = {
      ...event,
    };
    delete badEvent.httpMethod;

    // Act
    const response = await handler(badEvent);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(response.body).toBe(
      "Lambda didn't receive any event which contains path and/or http method!"
    );
  });
});

afterAll(() => {
  execSync(`rm -rf ${getCopyTargetDirectory()}`);
});

function getOriginalTargetDirectory() {
  return path.join(__dirname, "../target");
}

function getCopyTargetDirectory() {
  return path.join(__dirname, "target");
}
