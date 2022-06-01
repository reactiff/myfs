import { ShowHelp } from "utils/help.mjs";

// COMMAND MODULE PROPS
export const help = `fs storage utils`;
export const group = 'Utils';

export const options = {
  'S': {
    alias: 'summary',
    description: 'Display a high level summary of the results with stats',
    type: 'boolean',
  },
 
};

export async function execute(context) {
  try {

    debugger
    
    const { argv } = context;
    
    return ShowHelp;

  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
