export function parseOptions(argv, options) {

    const keys = Object.keys(options);

    for (let key of keys) {
        const option = options[key];

        const aliasKeys = Array.isArray(option.alias) ? option.alias : [option.alias];
        const aliases = [key, ...aliasKeys];

        let value;
        for (let a of aliases) {
            if (argv[a] !== undefined && value === undefined) {
                value = argv[a];
            }
        }

        if (value !== undefined) {
            for (let a of aliases) {
                if (argv[a] === undefined) {
                    argv[a] = value;
                }
            }
        }
        
    }

}