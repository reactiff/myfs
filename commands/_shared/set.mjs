import delegate from 'utils/delegate.mjs';
import store from "utils/store/index.mjs";

// COMMAND MODULE PROPS
export const help = `Store value by key`;
export const group = 'Settings';

export async function execute(args, argv, resolve, scope) {
  try {

    // Handle sub-commands
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
