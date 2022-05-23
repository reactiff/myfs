import path from 'path';
import fs from 'fs';
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export function getLocalPackage() {
    const cwd = path.resolve(process.cwd());
    const tokens = cwd.split('\\');
    let pkg;
    let j = tokens.length;
    while (j--) {
        const dir = tokens.slice(0, j + 1);
        const filePath = dir.join('\\') + '\\' + 'package.json';
        if (fs.existsSync(filePath)) {
            pkg = require(filePath);
            if (Reflect.has(pkg, 'workspaces')) {
                break;
            }
        }
    }
    if (!pkg || !pkg.name) throw new Error('package.json not found');
    return pkg;
}
