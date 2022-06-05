import { ShowHelp } from "utils/help.mjs";
import inspectErrorStack from "utils/inspectErrorStack.mjs";
import store from "utils/store/index.mjs";

// COMMAND MODULE PROPS
export const desc = `Globally manage filter settings for searching files`;
export const group = 'Filtering';

// export const options = {
//   'S': {
//     alias: 'show',
//     description: 'Show filter settings',
//     type: 'boolean',
//   }, 
// };

export async function execute(context) {
  try {

    const { argv } = context;

    debugger
    if (context.tail === 'filter') {
      const filter = store.get('filter');
      console.log(filter);
    }
    
    return ShowHelp;

  } catch (ex) {
    inspectErrorStack(ex);
  }
}
