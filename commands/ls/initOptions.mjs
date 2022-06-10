import _ from "lodash";
import minimatch from "minimatch";
import path from "path";
import { parseRegexInput } from "utils/parseRegexInput.mjs";
import { options } from "./options.mjs";
import { getFileSorter } from "./sort.mjs";
import timespan from 'timespan-parser';

export function initOptions(argv) {
  const opts = {};

  const optionEntries = Object.entries(options);
  for (let kv of optionEntries) {
    const k = kv[0];
    const v = kv[1];
    // const v = parseOptionValue(argv, kv[1]); //option def
    opts[k] = argv[v.alias] || argv[k] || v.default;
    opts[v.alias] = opts[k];
    opts[_.camelCase(v.alias)] = opts[k];
  }

  if (opts.glob) {
    opts.matchGlob = (filePath) => {
      const debugging = false;//filePath.includes('.pug');
      const pathToTest = filePath.replace(/\\/g, "/");
      return minimatch(pathToTest, opts.glob, { debug: debugging, partial: false });
    };
  }

  if (opts.age) {
    opts.maxAgeMs = timespan({ unit: "ms" }).parse(opts.age);
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
