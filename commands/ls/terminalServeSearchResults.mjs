import chalk from "chalk";
import { getSearchResultSorter } from "./sort.mjs";
// import { printActionMenu } from "./printActionMenu.mjs";
import boxen from "boxen";
import moment from 'moment';
import { printToConsole } from "utils/printToConsole.mjs";

export function terminalServeSearchResults(results, opts) {

  printToConsole("\n");
  printToConsole(
    boxen("Search results for: " + chalk.magenta(opts.find), { padding: 1 })
  );

  const items = results.items;

  items.sort(getSearchResultSorter(opts.orderBy));

  let itemNumber = 0;
  // Keep the console output parallel for now
  for (let item of items) {
    if (item.ok && item.lineResults.length > 0) {
      
      const duration = moment.duration(item.file.search.elapsed);
      
      const fileName = item.file.name;
      const filePath = item.file.fullPath;
 
      printToConsole('In ' + chalk.bold.white(filePath + ':'));
      itemNumber++;

      for (let lr of item.lineResults) {

        let line = lr.line;
        const lineNumber = lr.lineNumber;

        const matches = lr.matches;
        const tokens = matches.map((m) => m[0]);

        const gutter = chalk.bgHex('#111').hex('#915d14')(' ' + lineNumber.toString() + ': ');
        let source = gutter + chalk.bgHex('#000').gray(' ' + line);

        // replace matches with placeholder tags
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[0];
          source = source.replace(new RegExp(escapeRegExp(token), 'g'), `{{M[${i}]}}`);
        }

        // now put back the matches with additional formatting, replacing the tags
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[0];
          source = source.replace(new RegExp(escapeRegExp(`{{M[${i}]}}`), 'g'), chalk.bold.yellow(token));
        }

        console.group('')
        printToConsole(chalk.hex('#9cc8f7')(filePath + ':' + lineNumber));
        console.group('')
        printToConsole(source);
        console.groupEnd()
        console.groupEnd()
        printToConsole('');
      }
    }
  }
}

function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}