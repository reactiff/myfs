import parseArgs from "utils/validation.mjs";
import delegate from 'utils/delegate.mjs';

export async function execute(args, argv, resolve, scope) {
  try {

    debugger
    
    parseArgs(args, argv, [
      ['serve'],
    ]);
        
    if (delegate(args, argv, resolve, scope)) {
      return; 
    }

    throw new Error('Command not found');
    
  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
