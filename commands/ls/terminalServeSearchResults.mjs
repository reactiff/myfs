import chalk from "chalk";
import { getSearchResultSorter } from "./sort.mjs";
// import { printActionMenu } from "./printActionMenu.mjs";
import boxen from "boxen";

export function terminalServeSearchResults(update, scope) {
  const { opts } = scope;

  debugger
  
  console.log("\n");
  console.log(
    boxen("Search results for: " + chalk.magenta(opts.search), { padding: 1 })
  );

  update.results.sort(getSearchResultSorter(opts.order.name));

  // Keep the console output parallel for now
  for (let result of update.results) {
    if (result.ok && result.matches.length > 0) {
      // const duration = moment.duration(result.file.search.elapsed);
      console.groupCollapsed(
        chalk.greenBright(result.file.name),
        chalk.gray(result.file.fullPath)
      );

      console.log(result.matches.length + " matches");

      // for (let m of result.matches) {
      //   const text = m[0];
      //   const excerpt = m.input.substring(m.index, text.length)
      //   console.log(
      //     chalk.greenBright(m.index + ":" + text.length)
      //   );
      //   console.log(
      //     excerpt
      //   );
      // }

      console.groupEnd();
    }
  }

  // printActionMenu({ dir, myFs, opts });
}
