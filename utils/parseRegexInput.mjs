
export function parseRegexInput(input) {
    if (input.startsWith('/')) {
  
      let flags;
      if (!input.endsWith('/')) {
        const m = input.match(/\/(\w*?)$/);
        if (m) {
          flags = m[1];
          input = input.slice(0, input.length - flags.length);
        }
        else {
          throw new Error('Unknown error parsing regex input: ' + input);
        }
      }
      input = input.slice(1, input.length - 1);
      const ptrn = input.replace(/\\\\/g, '\\');
      const regex = new RegExp(ptrn, flags);
      return regex;
    }
    else {
      const ptrn = input.replace(/\\{2}/g, '\\');
      const regex = new RegExp(ptrn, 'mgi');
      return regex;
    }
  }