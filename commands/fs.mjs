import { ShowHelp } from "utils/help.mjs";

// COMMAND MODULE PROPS
export const help = `fs`;
export const group = 'Root';

export async function execute(context) {
  try {

    const { argv } = context;
        
    debugger
    
    return ShowHelp;

  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
