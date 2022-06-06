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
  B: {
    alias: "browse",
    description: "Display results in a browser",
    type: "boolean",
    default: false,
  },
  
};
