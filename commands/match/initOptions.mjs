// import _ from "lodash";
import chalk from "chalk";
import path from "path";
import { getFileSorter } from "../ls/sort.mjs";
import { parseRegexInput } from "utils/parseRegexInput.mjs";
import { options } from "./options.mjs";

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const minimatch = require("minimatch");
import minimatch from "minimatch";

export function initOptions(argv) {
  
  const opts = {};

  const optionEntries = Object.entries(options);
  for (let kv of optionEntries) {
    const k = kv[0];
    const v = kv[1]; //option def
    opts[v.alias] = argv[v.alias] || argv[k] || v.default;
  }
  
  return opts;
}
