import store from "utils/store.mjs";
import parseArgs from "utils/validation.mjs";
import _ from 'lodash';
import delegate from 'utils/delegate.mjs';

export async function execute(args, argv, resolve, scope) {
  try {

    if (delegate(args, argv, resolve, scope)) {
      return; 
    }

    // Do your thing!
    store.set(args[0], args[1]);
    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
