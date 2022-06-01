// COMMAND MODULE PROPS
export const desc = `Hyper Apps`;
export const group = 'Web Apps';

export async function execute(context) {
  try {

    const { argv } = context;
    
    return ShowHelp;
    
  } catch (ex) {
    throw new Error(ex.message || ex);
  }
}
