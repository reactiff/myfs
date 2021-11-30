import parseArgs from "utils/validation.mjs";
import _ from 'lodash';

import delegate from 'utils/delegate.mjs';

export async function execute(args, argv, resolve, scope) {
  try {
    parseArgs(args, argv, [
      ['ls'],
    ]);
    
    if (delegate(args, argv, resolve, scope)) {
      return; 
    }
    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
