import Configstore from "configstore";
import chalk from "chalk";
import columnify from "columnify";
import boxen from "boxen";
import toDictionary from "../toDictionary.mjs";
import { printToConsole } from "../printToConsole.mjs";

const store = new Configstore("fs", {});

function set(k, v) {
  store.set(k, v);
}

function erase(k) {
  store.delete(k);
}


function formatScalar(value, formatItem = (x) => x) {
  if (value === undefined) return chalk.gray("(not set)") ;
  return formatItem(value);
}

function formatArray(arr, formatItem = (x) => x) {
  if (arr.length === 0) return chalk.gray("(empty)");
  const data = toDictionary(arr, 
    (item, index) => `${index}.`,
    (item, index) => formatItem(decodeURIComponent(item))
  );
  return columnify(data, {showHeaders: false});
}

function show(k, formatItem, items) {

  const state = items || store.get(k);

  const content = Array.isArray(state) 
    ? formatArray(state, formatItem)
    : formatScalar(state, formatItem);

  printToConsole();
  printToConsole(content);

  //   boxen(content, {
  //     title: k,
  //     dimBorder: true,
  //     textAlignment: "center",
  //     padding: 1,
  //     borderStyle: "round",
      
  //   })
  // );
  printToConsole();
}

function add(listName, item, unique = false) {
  const encoded = encodeURIComponent(item.replace(/\\\\/g, "\\"));

  const items = store.get(listName) || [];
  if (unique && items.includes(encoded)) {
    printToConsole(chalk.bgYellow.black("Already exists:"), item);
    return;
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
    return;
  }

  const index = items.findIndex((x) => x === encoded);
  items.splice(index, 1);
  set(listName, items);

  show(listName, (item) => decodeURIComponent(item));
}

function rekey(oldKey, newKey) {
  if (!store.has(oldKey)) {
    printToConsole(chalk.bgYellow.black("Key does not exists:"), oldKey);
    return;
  }
  const value = store.get(oldKey);
  store.set(newKey, value);
  store.delete(oldKey);
}

export default {
  all: store.all,
  has: store.has,
  get: store.get,
  set,
  erase,
  show,
  add,
  remove,
  rekey,
};
