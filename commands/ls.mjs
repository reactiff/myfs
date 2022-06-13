import MyFS from "utils/myfs.mjs";
import { printResults } from "./ls/printResults.mjs";
import { summaryTable } from "./ls/summaryTable.mjs";
import { terminalServeSearchResults } from "./ls/terminalServeSearchResults.mjs";
import { initOptions } from "./ls/initOptions.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import webbify from "hyperspace/webbify.mjs";

import path from "path";

// COMMAND MODULE PROPS
export { options } from "./ls/options.mjs";

export const command = 'ls [glob]';
export const desc = `Search and manage files across directories`;
export const group = 'File Search';

async function browseResults(results, opts) {

  // NEWER
  const schema = {
    title: "Search Results",
    src: path.resolve("hyperspace/static/ls"),
    hotUpdate: true,
  };
  
  const data = results.items
    .map(i => ({ ...{ title: i.name }, ...i.stat }));
  
  const p = await webbify(schema).catch(inspectErrorStack);

  p.render({ 
    target: "main", 
    template: "item", 
    data 
  });
}

function presentSearchResults(results, opts) {
  if (opts.webbify) return browseResults(results, opts);
  terminalServeSearchResults(results, opts);
}

function presentResults(results, opts) {
  if (opts.webbify) return browseResults(results, opts);
  if (opts.summary) return summaryTable(results, { palette: { table: { bg: "#002200" } } });
  if (opts.find) return presentSearchResults(results, opts);
  printResults(results, opts);
}

export async function execute(context) {
  try {

    const opts = initOptions(context.argv);
    
    

    const results = await MyFS.execute(opts);
    
    presentResults(results, opts);

      
  } catch (ex) {
    inspectErrorStack(ex);
  }
}
