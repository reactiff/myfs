/* eslint-disable no-undef */
function fnOrValue(v, ...args) { return typeof v === 'function' ? v(...args) : v; }

var createHyperState = function (wsProxy) { 
    const _ws = wsProxy;
    const _hooks = [];
    const _state = fnOrValue() || {}; 

    function getAffectedHooks(partial) {
        const affected = [];
        _hooks.forEach(h => {
            let sample;
            if (h.path===undefined || h.path===null || h.path==='') {
                debugger
                sample = _state;
                h.snapshot = sample;
                affected.push(h);
                return;
            }
            sample = _.get(partial, h.path);
            if (sample !== undefined) {
                const areEqual = sample == h.snapshot;
                if (!areEqual) {
                    h.snapshot = sample;
                    affected.push(h);
                }
            }
        });
        return affected;
    }

    const _assignState = (partial) => {
        const affected = getAffectedHooks(partial);
        Object.assign(_state, partial);
        affected.forEach(w => w.callback(_.get(_state, w.path)));
    }

    wsProxy.receive = _assignState;

    function assign(data) {
        _assignState(data);
        _ws.send(data);
    }

    function addHook(path, callback) {
        _hooks.push({ path, callback, snapshot: _.get(_state, path)});
    }

    function removeHook(path, callback) {
        const i = _hooks.findIndex(x => x.path === path && x.callback === callback);
        if (i >= 0) {
            _hooks.splice(i, 1);
        }
    }

    function get(path) {
        return _.get(_state, path);
    }

    return new function () { 
        Object.assign(this, {
            assign,
            addHook,
            removeHook,
            get,
        });
        return this; 
    }; 
}; 

