import nomnoml from 'nomnoml';
import { ShowHelp } from "utils/help.mjs";

// COMMAND MODULE PROPS
export const desc = `draw a diagram`;
export const group = 'Utils';
export const options = {
};

export async function execute(context) {
  try {
    
    const { argv } = context;
    
    debugger

    var src = '[nomnoml] is -> [awesome]'
    

    //return ShowHelp;

  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
