// import _ from 'lodash';
import fs from 'fs';
import path from 'path';
// import handleCatch from 'utils/rethrow.mjs';
import inspectErrorStack from 'utils/inspectErrorStack.mjs';

// try to find a submodule that matches the next arg and let it handle the rest
export default function delegate(args, argv, resolve, fsItem, context) {
    if (args.length < 1) { return false; }
    
    const next = args[0];

    const basename = path.basename(fsItem.fullPath);
    const pathHere = fsItem.fullPath.replace(basename, '');
    const abspath = path.join(pathHere, fsItem.moduleName, next + '.mjs');

    if (fs.existsSync(abspath)) {
      import(`commands/${fsItem.moduleName}/${next}.mjs`)
        .then(m => {
          m.execute(args.slice(1), argv, resolve, fsItem).catch(inspectErrorStack);
        })
        .catch(inspectErrorStack);
      return true;
    }
  }