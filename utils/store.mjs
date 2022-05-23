import Configstore from "configstore";
import chalk from "chalk";
import moment from "moment";

const store = new Configstore("fs", {});

function _pushHist(k) {
  const state = store.get(k);
  if (state !== undefined) {
    const hist = store.get(k + "__history") || [];
    hist.push({
      timestamp: Date.now(),
      state,
    });
    store.set(k + "__history", hist);
  }
}

function set(k, v) {
  _pushHist(k);
  store.set(k, v);
}

function _revert(k) {
  const hist = store.get(k + "__history") || [];
  if (hist.length === 0) {
    return;
  }
  const prior = hist.pop();
  store.set(k, prior.state);
  store.set(k + "__history", hist);
  return prior.state;
}

function _hist(k) {
  const hist = store.get(k + "__history") || [];
  return hist;
}

function hist(k) {
  const history = _hist(k);
  let i = 0;
  console.group(chalk.yellow(`"${k}" history`));
  for (let entry of history) {
    const timestampCaption = moment(new Date(entry.timestamp)).fromNow();
    console.group( chalk.underline(timestampCaption) );
    show(k, (item) => decodeURIComponent( chalk.green(item)), entry.state);
    console.groupEnd();
  }
}

function clear(k, clearedState) {
  set(k, clearedState);
  console.log(chalk.bgYellow.black(`"${k}" cleared`));
  process.exit();
}

function revert(k) {
  const value = _revert(k);
  console.log(chalk.yellow(`"${k}" reverted to`));
  show(k, (item) => decodeURIComponent( chalk.green(item)), value);
  process.exit();
}

function show(k, formatItem, items) {
  
  !items && console.log(chalk.yellow(k));
  
    const state = items || store.get(k);
  if (Array.isArray(state)) {
    for (let item of state) {
      const text = formatItem ? formatItem(item) : item;
      console.log(text);
    }
    if (state.length === 0) {
      console.log("(empty list)");
    }
  } else {
    if (state !== undefined) {
      const text = formatItem ? formatItem(state) : state;
      console.log(text);
    } else {
      console.log("(not set)");
    }
  }
  console.log();

  if (!items) {
    process.exit();
  }
}

function add(listName, item) {
  const encoded = encodeURIComponent(item.replace(/\\\\/g, "\\"));

  const items = store.get(listName) || [];
  if (items.includes(encoded)) {
    console.log(chalk.bgYellow.black("Already exists:"), item);
    process.exit();
  }

  items.push(encoded);
  set(listName, items);

  show(listName, (item) => decodeURIComponent(item));
}

function remove(listName, item) {
  const encoded = encodeURIComponent(item.replace(/\\\\/g, "\\"));

  const items = store.get(listName) || [];
  if (!items.includes(encoded)) {
    console.error(chalk.bgYellow.black("Not found: "), item);
    process.exit();
  }

  const index = items.findIndex((x) => x === encoded);
  items.splice(index, 1);
  set(listName, items);

  show(listName, (item) => decodeURIComponent(item));
}

export default {
  all: store.all,
  get: store.get,
  set,
  revert,
  clear,
  show,
  hist,
  add,
  remove,
};
