import chalk from "chalk";
import path from "path";
import minimatch from "minimatch";
import { getProgramDirectory } from "../bin/getProgramDirectory.mjs";
import { printToConsole } from "./printToConsole.mjs";

function printSchemaValidationErrors(error) {
      
  printToConsole(chalk.bgHex("#880000").bold.whiteBright(error.message));
  
    error.list.forEach((err, index) => {
      printToConsole(
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
  
    printToConsole();
    printToConsole(chalk.underline("Present keys"));
  
    const schemaKeys = Object.keys(error.schema);
  
    schemaKeys.forEach((key, index) => {
      printToConsole(
        index + 1 + ".",
        chalk.cyan(key),
        ":",
        chalk.hex("#ffaa00")(error.schema[key])
      );
    });
  
    printToConsole();
}
  

function inspectErrorStack(error) {

  if (error.type === "schemaValidation") {
    printSchemaValidationErrors(error);
  }

  const rootPath = getProgramDirectory();

  if (error.code) {
    printToConsole(chalk.bgHex("#880000").bold.whiteBright(" " + error.code + " "));
  }

  const report = [];

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

          // because splitting the line by : splits the filename in two due to drive name having :
          // so the Row and Col tokens can shift from positions 1 and 2 into positions 2 and 3
          // however when reversed, Col is always at position 0 and Row at position 1 
          // The remaining file tokens should be reversed again and joined by :

          const rTokens = captured.split(":").reverse();
          const [col, row, ...fileTokens] = rTokens;
          fileInfo = { col, row, file: fileTokens.reverse().join(':') };
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
      report.push(
        offset,
        current ? chalk.bgHex("#880000").whiteBright(" " + line.trim() + " ")
          : chalk.red(line.trim())
      );
    } else {
      report.push(offset, chalk.gray(line.trim()));
    }
  }

  report.push("  " + chalk.bgHex("#330000").white(error.message));
  report.push("");

  printToConsole(report.join('\n'));

  // terminate the process
  // UNCOMMENTED BECAUSE IT BREAKS JEST TESTS, and it is an antipattern.
  // process.exit();

  throw new Error(error.message);

}

export default inspectErrorStack;
