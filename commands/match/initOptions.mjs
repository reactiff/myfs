// import _ from "lodash";
import { options } from "./options.mjs";

export function initOptions(argv) {
  
  const opts = {};

  const optionEntries = Object.entries(options);
  for (let kv of optionEntries) {
    const k = kv[0];
    const v = kv[1]; //option def
    opts[k] = argv[v.alias] || argv[k] || v.default;
    opts[v.alias] = opts[k];
  }
  
  return opts;
}
