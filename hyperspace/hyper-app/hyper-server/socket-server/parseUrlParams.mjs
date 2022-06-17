
export function parseUrlParams(url) {
  const pos = url.indexOf("?");
  if (pos < 0)
    return {};
  return url
    .slice(pos + 1)
    .split("&")
    .map(t => t.split("="))
    .reduce((m, t) => Object.assign(m, { [t[0]]: t[1] }), {});
}
