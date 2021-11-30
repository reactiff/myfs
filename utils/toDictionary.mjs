import fnOrValue from './fnOrValue.mjs';

function toDictionary(input, keyForItem, valueOrGetterForItem) {
    const items = Object.values(input);
    const dict = {};
    for(let i=0; i<items.length; i++) {
        const key = fnOrValue(keyForItem, items[i], i);
        dict[key] = valueOrGetterForItem !== undefined 
            ? fnOrValue(valueOrGetterForItem, items[i], i) 
            : items[i];
    }
    return dict;
}

export default toDictionary;