// hyperspace/hyper-app/public/js/utils.js

function fnOrValue(v, ...args) { return typeof v === 'function' ? v(...args) : v; }

function logInfo(name, message) {
  console.log("%c" + message, "color: #ffffff");
}
function logError(name, message) {
  console.log("%c" + message, "color: #ff0000");
}
