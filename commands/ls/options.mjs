export const options = {
  o: {
    alias: "order-by",
    description: "name|size|atime|mtime|ctime|btime",
    type: "string",
    default: "mtime",
  },
  m: {
    alias: "modified",
    description: "Display recently modified files (same as sorting by mtime)",
    type: "string",
  },
  s: {
    alias: "summary",
    description: "Display summary of listed files",
    type: "string",
    default: "mtime",
  },
  r: {
    alias: "recursive",
    description: "Recursively search all sub directories. (Default is TRUE)",
    type: "boolean",
    default: true,
  },
  g: {
    alias: "glob",
    description: "Match file path to glob",
    type: "string",
  },
  f: {
    alias: "find",
    description: "Find regex pattern in files",
    type: "string",
  },
  b: {
    alias: "browse",
    description: "Display results in a browser",
    type: "boolean",
    default: false,
  },
  
};
