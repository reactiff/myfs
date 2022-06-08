import _ from "lodash";
import minimatch from "minimatch";
import path from "path";
import { parseRegexInput } from "utils/parseRegexInput.mjs";
import { options } from "./options.mjs";
import { getFileSorter } from "./sort.mjs";

export function initOptions(argv) {
  const opts = {};

  const optionEntries = Object.entries(options);
  for (let kv of optionEntries) {
    const k = kv[0];
    const v = kv[1]; //option def
    opts[k] = argv[v.alias] || argv[k] || v.default;
    opts[v.alias] = opts[k];
    opts[_.camelCase(v.alias)] = opts[k];
  }

  if (opts.glob) {
    opts.matchGlob = (filePath) => {
      const pathToTest = filePath.replace(/\\/g, "/");
      return minimatch(pathToTest, opts.pattern, { debug: false });
    };
  }

  if (opts.find) {
    opts.find = parseRegexInput(opts.find);
  }

  // sorting

  if (opts.modified) {
    opts.orderBy = opts.o = 'mtime';
  }

  if (opts.orderBy) {
    opts.sortFiles = getFileSorter(opts.orderBy);
  }
  
  return opts;
}
