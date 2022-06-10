import _ from "lodash";

const reFunction = /\([[:alnum:]]+?,\s*?[[:alnum:]]+?\)\s*?=>.+/;

const sortFilesByStringAtPath = (path, defaultValue) => (a, b) => {
  const astr = (_.get(a, path)||defaultValue||'').toLowerCase();
  const bstr = (_.get(b, path)||defaultValue||'').toLowerCase();
  if (astr < bstr) return -1;
  if (astr > bstr) return 1;
  return 0;
};

const sortObjectsByValueAtPath = (path) => (a, b) => {
  if (_.get(a, path) < _.get(b, path)) return -1;
  if (_.get(a, path) > _.get(b, path)) return 1;
  return 0;
};

const fileSort = {
  default: sortFilesByStringAtPath("name"),
  path: sortFilesByStringAtPath("relativePath", '/'),
    
  size: (a, b) => b.stat.size - a.stat.size,
  atime: (a, b) => b.stat.atimeMs - a.stat.atimeMs,
  btime: (a, b) => b.stat.birthtimeMs - a.stat.birthtimeMs,
  birthtime: (a, b) => b.stat.birthtimeMs - a.stat.birthtimeMs,
  ctime: (a, b) => b.stat.ctimeMs - a.stat.ctimeMs,
  mtime: (a, b) => b.stat.mtimeMs - a.stat.mtimeMs,
};

// const result = {
//   file: fsi,
//   ok, 
//   matches,
//   error,
// };


const searchResultSort = {
  default: sortObjectsByValueAtPath('file.name'),
  size: (a, b) => b.file.stat.size - a.file.stat.size,
  atime: (a, b) => b.file.stat.atimeMs - a.file.stat.atimeMs,
  btime: (a, b) => b.file.stat.birthtimeMs - a.file.stat.birthtimeMs,
  birthtime: (a, b) => b.file.stat.birthtimeMs - a.file.stat.birthtimeMs,
  ctime: (a, b) => b.file.stat.ctimeMs - a.file.stat.ctimeMs,
  mtime: (a, b) => {
    return b.file.stat.mtimeMs - a.file.stat.mtimeMs
  },
};


export function getFileSorter(order) {
  const key = order;
  if (Reflect.has(fileSort, key)) return fileSort[key];
  if (reFunction.test(key)) {
    return eval(key);
  }
  return fileSort.default;
}

export function getSearchResultSorter(order) {
  const key = order;
  if (Reflect.has(searchResultSort, key)) return searchResultSort[key];
  return eval(key);
  // return searchResultSort.default;
}
