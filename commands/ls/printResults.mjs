import _ from "lodash";
import chalk from "chalk";
import moment from "moment";

chalk.level = 3;

export function printResults(fsItems, options) {

  console.log();
  console.log(`${fsItems.items.length} results`);
  console.log();

  const colDefs = getColDefs(fsItems, options);
  
  printColHeaders(colDefs, options);

  let cnt = 1;


  fsItems.items.forEach((f) => {
    if (colDefs.length) {
      const sizeCol = colDefs[2];
      const timeCol = colDefs[3];
      
      let timeColor;
      const ms = f.stat[timeCol.name];
      const msDiff = Date.now() - ms;
      const ms_day = 86400000 / 4;
      const pct_of_day = msDiff / ms_day;
      const G = 128 - Math.round(128 * pct_of_day);

      if (msDiff < ms_day) {
        timeColor = [128, 128 + G, 128];
      } else {
        timeColor = [64, 64, 64];
      }

      const formatTime = (x) => timeCol.format(timeCol.convert(x));
      const formatSize = (x) => sizeCol.format(sizeCol.convert(x));

      const posix = f.path.replace(/\\/g, "/");
      const relativePath = '.' + posix.slice(global.__basedir.length);

      console.log(

        // #
        chalk.gray((cnt++).toString().padEnd(3)),

        // name
        f.name.padEnd(colDefs[1].length, " "),

        // size
        chalk.gray(formatSize(f.stat.size)),

        // time
        chalk.rgb(...timeColor)(formatTime(f.stat[timeCol.name])),

        // path
        chalk.gray(relativePath)
      );
    } else {
      console.log(f.fullPath);
    }
  });

  console.log("");
}


function convertTime(x) {
  return moment(new Date(x)).fromNow(true);
}

function convertSize(x) {
  let value, units;
  return {
    value: x,
    units: '',
  };

  // the following converts to KBs and MBs etc.

  // if (x < 1024) { 
  //   value = parseInt(x);
  //   units = ' B';
  // }
  // else if (x < 1024 * 1000) {
  //   value = Math.ceil(parseFloat(x / 1024));
  //   units = 'KB';
  // }
  // else if (x < 1024 * 1000000) {
  //   value = Math.ceil(parseFloat(x / 1024000));
  //   units = 'MB';
  // }
  // else if (x < 1024 * 1000000000) {
  //   value = Math.ceil(parseFloat(x / 1024000000));
  //   units = 'GB';
  // }
  // else if (x < 1024 * 1000000000000) {
  //   value = Math.ceil(parseFloat(x / 1024000000000));
  //   units = 'TB';
  // }
  // return {
  //   value, 
  //   units
  // }; 
}

function padLeft(l) {
  return (x) => x.toString().padStart(l, " ");
}

function padRight(l) {
  return (x) => x.toString().padEnd(l, " ");
}

function getColDefs(fsItems, options) {
  let order;
  switch (options.order) {
    case "name":
      order = "name";
      break;
    case "size":
      order = "size";
      break;
    case "btime":
      order = "birthtimeMs";
      break;
    default:
      order = options.order + "Ms";
  }

  const timeColName = options.order === "name" ? "mtimeMs" : order;

  // name
  const l1 = fsItems.items.reduce(
    (a, item) => Math.max(a, item.name.length),
    0
  );

  // size
  const l2 = fsItems.items.reduce((a, item) => {
    const s = convertSize(item.stat.size);
    const value = s.value + s.units;
    return Math.max(a, value.length);
  }, 0);

  // time
  const l3 = fsItems.items.reduce((a, item) => {
    const value = convertTime(item.stat[timeColName]);
    return Math.max(a, value.length);
  }, 0);

  // path
  const l4 = fsItems.items.reduce((a, item) => {
    const value = item.path;
    return Math.max(a, value.length);
  }, 0);

  return [
    { name: "#", length: 3 },
    { name: "name", length: l1 },
    { name: "size", length: l2, convert: convertSize, format: (s) => (s.value + s.units).padStart(l2, " ") },
    { name: timeColName, length: l3, convert: convertTime, format: padLeft(l3) },
    { name: "path", length: l4 },
  ];
}

function printColHeaders(colDefs, options) {
  const headers = [...colDefs.map((cd) => cd.name.padEnd(cd.length, " "))];
  console.log(...headers);
  const dashes = [...colDefs.map((cd) => chalk.gray("-".repeat(cd.length)))];
  console.log(...dashes);
}
