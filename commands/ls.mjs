import MyFS from "utils/myfs.mjs";
import { printResults } from "./ls/printResults.mjs";
import { summaryTable } from "./ls/summaryTable.mjs";
import { terminalServeSearchResults } from "./ls/terminalServeSearchResults.mjs";
import { initOptions } from "./ls/initOptions.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import webbify from "hyperspace/webbify.mjs";

// COMMAND MODULE PROPS
export { options } from "./ls/options.mjs";
export const help = `Search and manage files across directories`;
export const group = 'File System';

function print(results, scope) {
  const { dir, opts } = scope;
  if (results.items.length && !opts.search) {
    printResults(results, { dir, order: opts.order });
    // summaryTable(results.items, { dir, palette: { table: { bg: "#002200" } } });
  }
}

export async function execute(context) {
  try {

    const opts = initOptions(context.argv);
    const { dir } = opts;

    const serveResults = opts.serve ? webbify : terminalServeSearchResults;

    const myfs = new MyFS();

    myfs
      .options(opts)
      .path(dir)
      .sort(opts.sorter)
      .onResults((update) => {
        debugger;
        serveResults(update, { dir: opts.dir, myfs, opts });
      });

    if (opts.dirs) { myfs.directories(); }
    if (opts.files) { myfs.files(); }

    const results = myfs.execute();
    

    if (!opts.webbify) {
      print(results, { dir, opts });
      return;
    }
    
    ///////////////////////////////
    // FROM HERE ONLY WEB RESULTS

    const schema = {
      title: "Search Results",
      src: "hyperspace/static/ls/",
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
      
  } catch (ex) {
    inspectErrorStack(ex);
  }
}
