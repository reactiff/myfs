export const options = {
  a: {
    alias: "age",
    description: "Max age for modified files to be shown",
    type: "string",
  },
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
    type: "boolean",
    default: false,
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
  x: {
    alias: "exclude",
    description: "Exclude glob",
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
