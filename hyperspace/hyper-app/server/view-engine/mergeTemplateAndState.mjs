import { JSDOM } from 'jsdom';
import _ from 'lodash';

const { document } = (new JSDOM(`...`)).window;

const uniqueIds = [];
function createNewElementId(prefix) {
    const id = prefix + (uniqueIds.length + 1);
    uniqueIds.push(id);
    return id;
}

/** 
 * Find and replace all {path.in.state} tags with their corresponding values.
 * 
*/
export default function mergeTemplateAndState(view, state) {

    debugger

    // TODO: THIS SEEMS BROKEN.

    let mergedView = view;

    let matches;
    do {

        // const bindingTag = /\{\$\.([a-zA-Z0-9\.]+?)\}/gmi; // PREVIOUS REGEX
        const bindingTag = /\{\$\.([a-zA-Z0-9\\.]+?)\}/gmi; // NEW REGEX.  TEST IT.
        // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>^ inserted an extra back slash here, es-lint was complaining that escaping isn't necessary here...
        
        matches = [...mergedView.matchAll(bindingTag)];

        if (matches.length > 0) {
            const m = matches[0];

            const path = m[1];
            const value = _.get(state, path);
            
            const startPos = getStartOfOpeningTag(mergedView, m.index);
            const endPos = getEndOfClosingTag(mergedView, m.index);

            const before = mergedView.slice(0, startPos);
            const after = mergedView.slice(endPos + 1, mergedView.length);

            // Create element from html
            const elementHTML = mergedView.slice(startPos, endPos + 1);
            const tagNameMatch = elementHTML.match(/<([a-zA-Z]+?)>/i);
            const tagName = tagNameMatch[1];
            const element = document.createElement(tagName);
            // if (!element.id) {
            //     element.id = createNewElementId('-elem-');
            // }
            // element.className = ((element.className||'') + '-state-bound-').trim();
            element.dataset.bind = 'state';
            element.dataset.path = path;
            element.innerHTML = "";

            mergedView = before + element.outerHTML + after;
        }
    } while (matches.length > 0)

    return mergedView;
}

function getStartOfOpeningTag(view, i) {
    // scan backward looking for <
    let j = i;
    while (j--) {
        if (view[j] === '<') {
            return j;
        }
    }
}

function getEndOfClosingTag(view, i) {
    // scan forward looking for >
    let j = i;
    while (j++ < view.length) {
        if (view[j] === '>') {
            return j;
        }
    }
}
