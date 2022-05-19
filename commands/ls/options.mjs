export const options = {
  O: {
    alias: "order",
    description:
      "Sort by name|size|atime|mtime|ctime|btime",
    type: "string",
    default: "mtime",
  },
  D: {
    alias: "dirs",
    description: "Show directories only",
    type: "boolean",
  },
  F: {
    alias: "files",
    description: "Show files only",
    type: "boolean",
  },
  // new options
  G: {
    alias: "global",
    description: "Search global paths",
    type: "boolean",
    default: false,
  },
  R: {
    alias: "recursive",
    description: "search all sub-dirs. Default TRUE.",
    type: "boolean",
    default: true,
  },
  P: {
    alias: "pattern",
    description: "Path pattern to match",
    type: "string",
  },
  S: {
    alias: "search",
    description: "Search inside files for pattern",
    type: "string",
  },
  W: {
    alias: "webbify",
    description: "Http serve to the web",
    type: "boolean",
    default: false,
  },

};
