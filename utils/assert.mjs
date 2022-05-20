export function assert(truthy, assumption) {
  if (!assumption) throw new Error("what is the assumption?");
  if (!truthy) {
    const t = typeof truthy;
    if (t === 'undefined') throw new Error(`${assumption} not defined, not found or invalid`);
    if (t === 'boolean') throw new Error(`False assumption: ${assumption}`);
    if (t === 'number') throw new Error(`${assumption} is zero`);
    if (t === 'string') throw new Error(`${assumption} is empty`);
  }
}
