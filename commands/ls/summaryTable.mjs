import _ from "lodash";
import chalk from "chalk";
import path from "path";
import interactive from "utils/interactive.mjs";
import boxen from "boxen";
import columnify from "columnify";

import { createRequire } from "module";
const require = createRequire(import.meta.url);


export function summaryTable(items, scope) {
  const { dir, palette } = scope;

  const getItemFolder = (item) => {
    const fullPath = item.fullPath || item;
    const folder = fullPath.slice(dir.length + 1).split("\\")[0];
    return folder;
  };
  const getItemType = (item) => {
    const fullPath = item.fullPath || item;
    const fileType = path.extname(fullPath);
    return fileType;
  };

  const countIf = (condition) => (condition ? 1 : 0);

  // By folder
  const byFolder = items.reduce((map, item) => {
    const group = getItemFolder(item);
    const count = items.reduce(
      (total, item2) => total + countIf(getItemFolder(item2) === group),
      0
    );
    return Object.assign(map, { [group]: count });
  }, {});

  // By type
  const byType = items.reduce((map, item) => {
    const group = getItemType(item);
    const count = items.reduce(
      (total, item2) => total + countIf(getItemType(item2) === group),
      0
    );
    return Object.assign(map, { [group || '(no ext)']: count });
  }, {});

  const fldKeys = Object.keys(byFolder);
  const typKeys = Object.keys(byType);
  const rowCount = Math.max(fldKeys.length, typKeys.length);
  const cw = {
    col1: fldKeys.reduce((a, b) => Math.max(a, b.length), 0),
    col2: typKeys.reduce((a, b) => Math.max(a, b.length), 0),
  };

  // Data
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    const key1 = i < fldKeys.length ? fldKeys[i] : null;
    const key2 = i < typKeys.length ? typKeys[i] : null;
    rows.push({
      col1: key1 !== null
        ? key1.padEnd(cw.col1, " ") + `(${byFolder[key1]})`.padStart(6)
        : "",
      col2: key2 !== null
        ? key2.padEnd(cw.col2, " ") + `(${byType[key2]})`.toString().padStart(6)
        : "",
    });
  }

  console.log(
    chalk.bgHex(palette.table.bg)(
      columnify(rows, {
        minWidth: 20,
        config: {
          col1: {
            minWidth: cw.col1 + 6,
            headingTransform: () =>
              chalk.bgHex((palette.ch || palette.table).bg)("By Folder".padEnd(cw.col1 + 6, " ")),
          },
          col2: {
            minWidth: cw.col2 + 6,
            headingTransform: () =>
              chalk.bgHex((palette.ch || palette.table).bg)("By Type".padEnd(cw.col2 + 6, " ")),
          },
        },
      })
    )
  );

  console.log();
}
