
export default function parseArgs(args, argv, options) {

    if (args.length === 0 && options.length > 0) {
        throw new Error('Missing options: ' + options[0]);
    }
    // check that each arg is valid
    for (let i in args) {
        const arg = args[i];
        const opt = options[i];
        if (Array.isArray(opt) && !(opt.includes(arg) || opt.some(o => o === '*') )) {
            const [ firstOpt, ...rest ] = opt;
            
            throw new Error(`ahem... I wasn't expecting to see '${arg}' here, more like ${firstOpt} or ` + (rest.length ? rest.join(' or ') : 'something'));
        }
        if (typeof opt !== 'object') {
            if (opt === '*') continue;
            if (arg === opt) continue;
        }
    }

    return args;
}