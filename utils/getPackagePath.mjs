import path from 'path';
import fs from 'fs';
import { createRequire } from "module";

////////////////////////
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
////////////////////////

const require = createRequire(import.meta.url);

function getPackagePath() {

    return global.__basedir;

    // debugger
    // const root = require.main.paths[0].split('node_modules')[0].slice(0, -1);
    // return;

    // const cwd = path.resolve(__dirname);
    // const tokens = cwd.split('\\');
    // let pkg;
    // let j = tokens.length;
    // while (j--) {
    //     const dir = tokens.slice(0, j + 1);
    //     const filePath = path.join(dir.join('\\'), 'package.json');
    //     if (fs.existsSync(filePath)) {
    //         return dir.join('\\');
    //     }
    // }
}

export default getPackagePath;