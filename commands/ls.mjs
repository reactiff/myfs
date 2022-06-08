import MyFS from "utils/myfs.mjs";
import { printResults } from "./ls/printResults.mjs";
import { summaryTable } from "./ls/summaryTable.mjs";
import { terminalServeSearchResults } from "./ls/terminalServeSearchResults.mjs";
import { initOptions } from "./ls/initOptions.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import webbify from "hyperspace/webbify.mjs";

// COMMAND MODULE PROPS
export { options } from "./ls/options.mjs";
export const desc = `Search and manage files across directories`;
export const group = 'File Search';

function browseResults(results) {

  const schema = {
    title: "Search Results",
    src: "hyperspace/static/ls/",
    hotUpdate: true,
  };

  webbify(schema);

  // OR

  /////////////////////////////
  // MAYBE OLDER IMPLEMENTATION

  // const data = results.items
  //   .map(i => ({ ...{ title: i.name }, ...i.stat }));
  
  // const p = await webbify(schema).catch(inspectErrorStack);

  // p.render({ 
  //   target: "main", 
  //   template: "item", 
  //   data 
  // });
}

function presentSearchResults(results, opts) {
  if (opts.browse) return browseResults();
  terminalServeSearchResults();
}

function presentResults(results, opts) {
  if (opts.search) return presentSearchResults(results, opts);
  if (opts.summary) return summaryTable(results.items, { palette: { table: { bg: "#002200" } } });
  if (opts.browse) return browseResults(results);
  printResults(results.items, opts);
}

export async function execute(context) {
  try {

    const opts = initOptions(context.argv);
    const { dir } = opts;

    const myfs = new MyFS()
      .options(opts)
      .path(dir)
      .sort(opts.sortFiles)
      .execute((results) => {
        debugger;
        presentResults(results, { dir: opts.dir, myfs, opts });
      })
    
      
  } catch (ex) {
    inspectErrorStack(ex);
  }
}
