export default function fnOrValue(x, ...params) {
  if (typeof x === "function") {
    return x(...params);
  }
  return x;
}
