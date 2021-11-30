// import _ from "lodash";
import chalk from "chalk";
import path from "path";
import { getFileSorter } from "./sort.mjs";
import { parseRegexInput } from "utils/parseRegexInput.mjs";
import { options } from "./options.mjs";

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const minimatch = require("minimatch");
import minimatch from "minimatch";

export function initOptions(args, argv) {

  const opts = {
    order: argv.order || argv.O || options.O.default,
    global: argv.global || argv.G || options.G.default,
    recursive: argv.recursive || argv.R || options.R.default,
    pattern: argv.pattern || argv.P,
    search: argv.search || argv.S,
    dirs: argv.dirs || argv.D,
    files: argv.files || argv.F,
  };

  opts.webbify = argv.web || argv.W || options.W.default;
  
  if (opts.pattern) {
    if (opts.pattern.startsWith("/")) {
      const regex = parseRegexInput(opts.pattern);
      opts.pattern = (path) => {
        path.match(regex);
      };
    } else {
      //globbing
      const glob = opts.pattern;
      opts.matchPattern = (path) => {
        const linuxPath = path.replace(/\\/g, "/");
        const isMatch = minimatch(linuxPath, glob, { debug: false });
        return isMatch;
      };
    }
  }

  if (opts.search) {
    opts.search = parseRegexInput(opts.search);
  }

  opts.order = getFileSorter(opts.order);
  opts.dir = path.resolve(process.cwd());

  return opts;
}
