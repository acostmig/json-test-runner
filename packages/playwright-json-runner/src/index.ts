#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import path from "path";
import { runTests, TestRun } from "./runner";

// Get the test file from command-line arguments
const args = process.argv.slice(2);
const testFile = args[0] || "testrun.playwright.json";
const testFilePath = path.resolve(process.cwd(), testFile);

if (!existsSync(testFilePath)) {
  console.error(`❌ Error: Test file "${testFilePath}" not found.`);
  process.exit(1);
}

const runJson = JSON.parse(readFileSync(testFilePath, "utf-8"));
const testRun: TestRun = runJson;

runTests(testRun)
  .then(() =>console.log("✅ Tests completed."))
  .catch((error) => {
    console.error("❌ Error occurred while running tests:", error);
    process.exit(1); // Exit with error status code
  });