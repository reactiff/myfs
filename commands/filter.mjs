import { ShowHelp } from "utils/help.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import { printToConsole } from "utils/printToConsole.mjs";
import store from "utils/store/index.mjs";

// COMMAND MODULE PROPS
export const desc = `Globally manage filter settings for searching files`;
export const group = 'Filtering';

export async function execute(context) {
  try {
    const { argv } = context;

    if (context.tail === 'filter') {
      const filter = store.get('filter');
      printToConsole(filter);
    }
    
    return ShowHelp;

  } catch (ex) {
    inspectErrorStack(ex);
  }
}
