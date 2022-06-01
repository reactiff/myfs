import { ShowHelp } from "utils/help.mjs";

// COMMAND MODULE PROPS
export const desc = `Globally manage filter settings for searching files`;
export const group = 'Filtering';

export const options = {
  'O': {
    alias: 'some-feature',
    description: 'Enables some feature',
    type: 'boolean',
  },
  
};

export async function execute(context) {
  try {

    const { argv } = context;
    
    return ShowHelp;

  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
