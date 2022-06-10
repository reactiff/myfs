export default class ContentSearchResult {

    pattern;
    matches;

    line;
    lineNumber;

    constructor(scope) {
        Object.assign(this, scope);
    }
}