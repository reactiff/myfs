import { ShowHelp } from "utils/help.mjs";

// COMMAND MODULE PROPS
export const desc = `Http namespace`;
export const group = 'Web Apps';

export async function execute(context) {
  try {

    const { argv } = context;
    
    return ShowHelp;
    
  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
