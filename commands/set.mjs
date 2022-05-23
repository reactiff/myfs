import delegate from 'utils/delegate.mjs';
import store from "utils/store.mjs";

// COMMAND MODULE PROPS
export const help = `Store value by key`;
export const group = 'Settings';

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
