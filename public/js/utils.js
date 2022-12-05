function fnOrValue(v, ...args) { return typeof v === 'function' ? v(...args) : v; }

function logInfo(name, ...args) {
  console.log("%c" + args.join(' '), "color: #ffffff");
}
function logError(name, ...args) {
  console.log("%c" + args.join(' '), "color: #ff0000");
}
