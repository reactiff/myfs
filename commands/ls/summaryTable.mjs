import _ from "lodash";
import chalk from "chalk";
import path from "path";
import columnify from "columnify";
import memoize from "memoizee";
import fnOrValue from "utils/fnOrValue.mjs";
import boxen from "boxen";
import { printToConsole } from "utils/printToConsole.mjs";

export function summaryTable(results, scope) {
  const { items } = results;

  const getItemFolder = (item) => {
    const relativePath = item.relativePath !== undefined ? item.relativePath : item.file.relativePath;
    const tokens = relativePath.split("/");
    const folder = tokens[0] || tokens[1];
    return folder ? "./" + folder : ".";
  };

  const getItemType = (item) => {
    const fullPath = item.fullPath !== undefined ? item.fullPath : item.file.fullPath || item;
    const fileType = path.extname(fullPath);
    return fileType || '(no ext)';
  };

  const memoizedCountBy = memoize(countBy);

  const summarize = (items, binGetter, options = {}) => {
    const data = items.reduce((s, item) => {
      const value = binGetter(item);
      const count = memoizedCountBy(items, binGetter, value);
      return Object.assign(s, { [value]: count });
    }, {});
    const keys = Object.keys(data);
    keys.sort();
    const maxKeyLen = keys.reduce((m, k) => Math.max(m, k.length), 0);
    const sorted = keys.map((k) => chalk.hex(options.binColor||'#fff')(k.padEnd(maxKeyLen + 1)) + ': ' + data[k]);
    return [ chalk.white(options.title), '', ...sorted].join('\n');
  };

  const summary = [
    {
      byFolder: summarize(items, getItemFolder, { title: 'By Folder', binColor: '#aaffff' } ),
      byType: summarize(items, getItemType, { title: 'By Type', binColor: '#aaffaa' } ),
    }
  ];

  printToConsole();
  printToConsole(columnify(summary, { showHeaders: false, preserveNewLines: true, columnSplitter: ' | ' }));
  printToConsole();

  // printToConsole(boxen(columnify(summary.byType, { showHeaders: false }), {
  //   title: "File counts by Type",
  //   borderStyle: "round",
  //   padding: 1,
  // }));

  // printToConsole(boxen(columnify(summary.byFolder, { showHeaders: false }), {
  //   title: "File counts by Folder",
  //   borderStyle: "round",
  //   padding: 1,
  // }));
}

//////////////////////////////////////////////////////////

/**
 * Count number of keys that match the given value.
 * @param {Array} items
 * @param {Function} keyOrSelector
 * @param {Function} valueOrSelector
 * @param {Function} compare Example: (key, value) => key === value;
 * @example
 * // counts all cat-like animals
 * const catCount = countBy(animals, (a) => a.suborder, 'Feliformia');
 * @returns
 */
const countBy = (
  items,
  keyOrSelector,
  valueOrSelector,
  compare = (k, v) => k === v
) => {
  const countIfEqual = (k, v) => (compare(k, v) ? 1 : 0);
  return items.reduce((total, item) => {
    const key = fnOrValue(keyOrSelector, item);
    const value = fnOrValue(valueOrSelector, item);
    return total + countIfEqual(key, value);
  }, 0);
};
