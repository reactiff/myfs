function fnOrValue(v, ...args) { return typeof v === 'function' ? v(...args) : v; }

var createHyperState = function (wsProxy) { 
    const _ws = wsProxy;
    const _watchers = [];
    const _state = fnOrValue() || {}; 

    function getAffectedWatchers(partial) {
        const affected = [];
        _watchers.forEach(w => {
            const sample = _.get(partial, w.path);
            if (sample !== undefined) {
                const areEqual = sample == w.snapshot;
                if (!areEqual) {
                    w.snapshot = sample;
                    affected.push(w);
                }
            }
        });
        return affected;
    }

    const _assignState = (data) => {
        const subscribers = getAffectedWatchers(data);
        Object.assign(_state, data);
        subscribers.forEach(w => w.callback(_.get(_state, w.path)));
    }

    wsProxy.receive = _assignState;

    function assign(data) {
        _assignState(data);
        _ws.send(data);
    }

    function watch(path, callback) {
        _watchers.push({ path, callback, snapshot: _.get(_state, path)});
    }

    function unwatch(path, callback) {
        const i = _watchers.findIndex(x => x.path === path && x.callback === callback);
        if (i >= 0) {
            _watchers.splice(i, 1);
        }
    }

    function get(path) {
        return _.get(_state, path);
    }

    return new function () { 
        Object.assign(this, {
            assign,
            watch,
            unwatch,
            get,
        });
        return this; 
    }; 
}; 

