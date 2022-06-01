import { ShowHelp } from "utils/help.mjs";

// COMMAND MODULE PROPS
export const desc = `fs storage utils`;
export const group = 'Utils';
export const options = {
};

export async function execute(context) {
  try {
    
    const { argv } = context;
    
    return ShowHelp;

  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
