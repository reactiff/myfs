import store from "utils/store.mjs";
import _ from 'lodash';

// COMMAND MODULE PROPS
export const help = `Get value by key`;
export const group = 'Settings';

export async function execute(args, argv, resolve, fsitem) {
  try {

    if (args.length < 1) {
      console.log(store.all);
      return
    }
    const value = _.get(store.all, args[0]);

    console.log(value);
    
    resolve();
  } catch (ex) {
    throw new Error(ex.message);
  }
}
