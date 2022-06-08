import chalk from "chalk";
import path from "path";
import minimatch from "minimatch";
import { getProgramDirectory } from "../bin/getProgramDirectory.mjs";

function printSchemaValidationErrors(error) {
    debugger;
      
    console.log(chalk.bgHex("#880000").bold.whiteBright(error.message));
  
    error.list.forEach((err, index) => {
      console.log(
        index + 1 + ".",
        chalk.red(
          [
            // err.instancePath,
            err.keyword,
            err.message,
            Object.entries(err.params)
              .map((kv) => kv[0] + ": " + kv[1])
              .join("\n"),
          ].join(" ")
        )
      );
    });
  
    console.log();
    console.log(chalk.underline("Present keys"));
  
    const schemaKeys = Object.keys(error.schema);
  
    schemaKeys.forEach((key, index) => {
      console.log(
        index + 1 + ".",
        chalk.cyan(key),
        ":",
        chalk.hex("#ffaa00")(error.schema[key])
      );
    });
  
    console.log();
  
    process.exit();
  }
  

function inspectErrorStack(error) {

  if (error.type === "schemaValidation") {
    printSchemaValidationErrors(error);
  }

  const rootPath = getProgramDirectory();

  if (error.code) {
    console.log(
      chalk.bgHex("#880000").bold.whiteBright(" " + error.code + " ")
    );
  }

  const lines = error.stack.split("\n");

  for (let i = lines.length - 1; i > 0; i--) {
    const line = lines[i].trim().replace(/<anonymous>/gim, "");

    let fileInfo = { file: "" };

    try {
      const fi1 = [...line.matchAll(/file:\/\/\/([\w\W]+?\d)\)*$/gim)];
      if (fi1 && fi1.length > 0) {
        const tokens = fi1[0][1].split(":");
        const col = tokens.splice(tokens.length - 1, 1)[0];
        const row = tokens.splice(tokens.length - 1, 1)[0];
        const file = tokens.join(":");
        fileInfo = { file, row, col };
      } else {
        const fi2 = [...line.matchAll(/\(([\w\W]+?)\)$/gim)];
        if (fi2 && fi2.length > 0) {
          const captured = fi2[0][1];
          const [file, row, col] = captured.split(":");
          fileInfo = { file, row, col };
        }
      }

      if (!fileInfo) {
        debugger;
      } 

    } catch (ex) {
      debugger;
    }

    const posixPath = fileInfo.file.replace(/\\/g, "/");
    const isInternal =
      minimatch(posixPath, "internal/**/*.*") ||
      minimatch(posixPath, "**/node_modules/**/*.*");

    if (!isInternal) {
      fileInfo.file = path.resolve(fileInfo.file);
      if (fileInfo.file.startsWith(rootPath)) {
        fileInfo.isProjectFile = true;
      }
    }

    const current = i === 1;
    const offset = "".repeat(lines.length - 1 - i) + (current ? "→" : "");

    if (fileInfo.isProjectFile) {
      console.log(
        offset,
        current ? chalk.bgHex("#880000").whiteBright(" " + line.trim() + " ")
          : chalk.red(line.trim())
      );
    } else {
      console.log(offset, chalk.gray(line.trim()));
    }
  }

  console.log("  " + chalk.bgHex("#330000").white(error.message));
  console.log();

  // terminate the process
  process.exit();
}

export default inspectErrorStack;
