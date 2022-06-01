import { ShowHelp } from "utils/help.mjs";

// COMMAND MODULE PROPS
export const desc = `fs results: lets you work with results from the last ls command or your previously saved result set`;
export const group = 'File Search Results';

export const options = {
  'S': {
    alias: 'summary',
    description: 'Display a high level summary of the results with stats',
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
