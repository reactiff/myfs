export function assert(truthy, assumption) {
  if (!assumption) throw new Error("what is the assumption?");
  if (!truthy) {
    const t = typeof truthy;
    if ('undefined') throw new Error(`${assumption} not defined, not found or invalid`);
    if ('boolean') throw new Error(`False assumption: ${assumption}`);
    if ('number') throw new Error(`${assumption} is zero`);
    if ('string') throw new Error(`${assumption} is empty`);
  }
}
