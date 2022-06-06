import MyFS from "utils/myfs.mjs";
import { printResults } from "./ls/printResults.mjs";
// import { summaryTable } from "./ls/summaryTable.mjs";
import { terminalServeSearchResults } from "./ls/terminalServeSearchResults.mjs";
import { initOptions } from "./match/initOptions.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import { ShowHelp } from "utils/help.mjs";
import { parseRegexInput } from "utils/parseRegexInput.mjs";
import { getFileSorter } from "./ls/sort.mjs";
import path from "path";

// COMMAND MODULE PROPS
export const command = "match [startPattern] [endPattern]"
export const desc = `Match file content using regular expressions`;
export const group = 'File Search';
export { options } from "./match/options.mjs";

function print(results, scope) {
  const { dir, opts } = scope;
  if (results.items.length && !opts.search) {
    printResults(results, { dir, order: opts.order });
    // summaryTable(results.items, { dir, palette: { table: { bg: "#002200" } } });
  }
}

export async function execute(context) {
  try {

    debugger

    const opts = initOptions(context.argv);
    
    if (!context.argv.startPattern) {
      return ShowHelp;
    }

    // combine start and end patterns into one with multi-line wildcard in between
    const regexPattern = context.argv.endPattern 
      ? context.argv.startPattern + '[\\w\\W]*?' + context.argv.endPattern
      : context.argv.startPattern

    opts.search = parseRegexInput(regexPattern);
    opts.sorter = getFileSorter(opts.order);
    opts.dir = path.resolve(process.cwd());

    
    const { dir } = opts;
    const serveResults = terminalServeSearchResults;

    const myfs = new MyFS();

    const results = myfs
      .options(opts)
      .path(dir)
      .sort(opts.sorter)
      .onResults((update) => {
        debugger;
        serveResults(update, { dir: opts.dir, myfs, opts });
      })
      .execute();


    print(results, { dir, opts });

  } catch (ex) {
    inspectErrorStack(ex);
  }
}
