export default class Search {

    constructor(prior = {}) {
        this.omittedItems = prior.omittedItems || [];
        this.ignoredItems = prior.excludedItems || [];
        this.mismatchedPatterns = prior.mismatchedPatterns || [];
    }

}