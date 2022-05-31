import _ from 'lodash';

// COMMAND MODULE PROPS
export const help = `Manage Notes`;
export const group = 'Notes';

export async function execute(context) {
  try {

    const { argv } = context;
    
    return ShowHelp;
    
  } catch (ex) {
    throw new Error(ex.message);
  }
}
