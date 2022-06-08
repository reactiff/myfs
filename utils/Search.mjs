export default class Search {

    constructor(prior = {}) {
        this.omittedItems = prior.omittedItems || [];
        this.ignoredItems = prior.excludedItems || [];
        this.mismatchedPatterns = prior.mismatchedPatterns || [];

        this.results = prior.results || [];
        this.startedCount = prior.startedCount || 0;
        this.finishedCount = prior.finishedCount || 0;
        this.progress = prior.progress || 0;    
    }

}