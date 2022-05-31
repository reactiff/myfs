import store from "utils/store/index.mjs";

// COMMAND MODULE PROPS
export const help = `Store value by key`;
export const group = 'Settings';

export async function execute(context) {
  try {

    const { args, argv } = context;

    // Do your thing!
    store.set(args[0], args[1]);
    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
