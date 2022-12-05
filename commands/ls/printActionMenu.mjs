// // import _ from "lodash";
// import chalk from "chalk";
// import { summaryTable } from "./summaryTable.mjs";
// import interactive from "utils/interactive.mjs";
// // import { createRequire } from "module";
// import boxen from "boxen";

// export async function printActionMenu(scope) {
//   const { dir, myFs, opts } = scope;
//   const context = myFs.search;

//   // Print exceptions summary
//   if (context.omittedItems.length) {
//     summaryTable(context.omittedItems, {
//       dir,
//       palette: { table: { bg: "#220000" }, ch: { bg: "#2a0000" } },
//     });
//   }

//   // INTERACTIVE MENU
//   const actionMenu = {};
//   if (context.omittedItems.length) {
//     actionMenu[
//       `Show [o]mitted items (no include) (${context.omittedItems.length})`
//     ] = () => {
//       logItemList(
//         chalk
//           .bgHex("#550000")
//           .white("Omitted items (no suitable include pattern)"),
//         context.omittedItems,
//         (path) => chalk.bgHex("#330000").white(path)
//       );
//     };
//   }
//   if (context.excludedItems.length) {
//     actionMenu[`Show e[x]cluded items (${context.excludedItems.length})`] =
//       () => {
//         logItemList(
//           chalk.white("Items") +
//             chalk.bgHex("#550000").white(" excluded ") +
//             chalk.white("by patterns"),
//           context.excludedItems,
//           (path) => chalk.bgHex("#330000").white(path)
//         );
//       };
//   }
//   if (context.mismatchedPatterns.length) {
//     actionMenu[
//       `Show items that the [g]lob pattern failed to match (${context.mismatchedPatterns.length})`
//     ] = () => {
//       logItemList(
//         chalk
//           .bgHex("#550000")
//           .white(`Items not matched by glob pattern: ${opts.pattern}`),
//         context.mismatchedPatterns,
//         (path) => chalk.bgHex("#330000").white(path)
//       );
//     };
//   }

//   actionMenu["[Q]uit"] = () => process.exit();

//   if (Object.keys(actionMenu).length) {
//     while (true) {
//       const input = await interactive.menu(actionMenu);
//       if (input === null) {
//         process.exit();
//       }
//     }
//   }
// }

// function logItemList(name, list, format) {
//   printToConsole();
//   console.group(boxen(name, { padding: 1 }));
//   printToConsole();
//   let cnt = 1;
//   for (let item of list) {
//     if (format) {
//       printToConsole(chalk.white(cnt++), format(item));
//       continue;
//     }
//     printToConsole(item);
//   }
//   console.groupEnd();
//   printToConsole();
// }
