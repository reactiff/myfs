export const options = {
  O: {
    alias: "order",
    description: "name|size|atime|mtime|ctime|btime",
    type: "string",
    default: "mtime",
  },
  S: {
    alias: "summary",
    description: "Display summary of listed files",
    type: "string",
    default: "mtime",
  },
  // D: {
  //   alias: "dirs",
  //   description: "Show directories only",
  //   type: "boolean",
  // },
  // F: {
  //   alias: "files",
  //   description: "Show files only",
  //   type: "boolean",
  // },
  // new options
  // G: {
  //   alias: "global",
  //   description: "Search global paths",
  //   type: "boolean",
  //   default: false,
  // },
  R: {
    alias: "recursive",
    description: "Recursively search all sub directories. (Default is TRUE)",
    type: "boolean",
    default: true,
  },
  P: {
    alias: "pattern",
    description: "Path pattern to match",
    type: "string",
  },
  s: {
    alias: "search",
    description: "Search inside files for pattern",
    type: "string",
  },
  W: {
    alias: "webbify",
    description: "Display results in a browser",
    type: "boolean",
    default: false,
  },
  
};
