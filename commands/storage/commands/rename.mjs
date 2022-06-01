import store from "utils/store/index.mjs";
import _ from 'lodash';

// COMMAND MODULE PROPS
export const help = `Rename existing key`;
export const group = '';

export const options = {
  'F': {
    alias: 'from',
    description: 'Existing key',
    type: 'string',
  },
  'T': {
    alias: 'to',
    description: 'New key',
    type: 'string',
  },
};
export async function execute(context) {
  try {

    const { args, argv } = context;
        
    debugger
    
    store.rename(
      argv.from,
      argv.to
    );
    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
