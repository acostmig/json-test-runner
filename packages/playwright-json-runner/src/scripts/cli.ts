#!/usr/bin/env ts-node

/**
 * scripts/cli.ts
 *
 * This is the main entry for your CLI.
 * It expects usage: 
 *    playwright-json-runner dump-json-schema <outputFile>
 */

import { dumpSchema } from ".."; // Import your function from wherever it's defined
import * as fs from "fs";

(async function main() {
  const [, , command, outputFile] = process.argv;

  if (command === "dump-json-schema") {
    // If user didn't specify a filename, default to "schema.json"
    const fileName = outputFile || "schema.json";
    try {
      // Suppose dumpSchema returns a JSON object or string
      const schemaJson = await dumpSchema(); 
      // If it’s an object, stringify; if it’s a string, just write directly
      fs.writeFileSync(fileName, typeof schemaJson === "string" ? schemaJson : JSON.stringify(schemaJson, null, 2));
      console.log(`Schema dumped to ${fileName}`);
    } catch (error) {
      console.error("Error dumping JSON Schema:", error);
      process.exit(1);
    }
  } else {
    console.log(
      `Usage:\n  playwright-json-runner dump-json-schema <outputFile>\n\nExample:\n  playwright-json-runner dump-json-schema schema.json`
    );
    process.exit(0);
  }
})();
