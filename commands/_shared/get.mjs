import store from "utils/store/index.mjs";
import _ from 'lodash';

// COMMAND MODULE PROPS
export const desc = `Get value by key`;
export const group = 'Settings';

export async function execute(context) {
  try {

    debugger

    const { args, argv } = context;

    if (args.length < 1) {
      console.log(store.all);
      return
    }

    const value = _.get(store.all, args[0]);

    console.log(value);
        
  } catch (ex) {
    throw new Error(ex.message);
  }
}
