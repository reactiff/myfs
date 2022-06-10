export default class SearchSession {

    constructor(_myfs) {
        this.myfs = _myfs;
        
        this.omittedItems = [];
        this.ignoredItems = [];
        this.mismatchedPatterns = [];
        this.filteredPatterns = [];

        this.results = [];
        this.startedCount = 0;
        this.finishedCount = 0;
        this.progress = 0;    
    }
    
    execute() {
        const files = this.myfs.items.filter(f => f.stat.isFile());
        files.forEach(f => f.executeSearch())
    }

}