import parseArgs from "utils/validation.mjs";
import delegate from 'utils/delegate.mjs';

// COMMAND MODULE PROPS
export const help = `Hyper Apps`;
export const group = 'Web Apps';

export async function execute(args, argv, resolve, fsItem, context) {
  try {

    debugger

    if (delegate(args, argv, resolve, fsItem, context)) {
      return; 
    }

    throw new Error('Command not found');
    
  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
