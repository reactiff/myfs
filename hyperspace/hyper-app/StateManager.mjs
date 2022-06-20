import _ from "lodash";

export default class StateManager {
  _state = {};
  _hooks = [];

  constructor(initialState) {
    this._state = initialState;
  }

  getAffectedCallbacks(partial) {
    const affected = [];
    this._hooks.forEach((w) => {
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

  getState(path) {
    if (path) return _.get(this._state, path);
    return this._state;
  }

  update(data) {
    const callbacks = this.getAffectedCallbacks(data);
    Object.assign(this._state, data);
    callbacks.forEach((w) => w.callback(_.get(this._state, w.path)));
  }

  // subscriptions to state changes
  watch(path, callback) {
    this._hooks.push({ path, callback, snapshot: _.get(this._state, path) });
  }

  unwatch(path, callback) {
    const i = this._hooks.findIndex(
      (x) => x.path === path && x.callback === callback
    );
    if (i >= 0) {
        this._hooks.splice(i, 1);
    }
  }
}
