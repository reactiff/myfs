import _ from "lodash";

export default class StateManager {
  _controller;
  _state = {};
  _hooks = [];

  constructor(controller, initialState) {
    this._controller = controller;
    this._state = initialState;
  }

  triggerAffectedHooks() {
    this._hooks.forEach((w) => {
      const sample = _.get(this._state, w.path);
      if (sample !== undefined) {
        const areEqual = sample == w.snapshot;
        if (!areEqual) {
          w.snapshot = sample;
          w.callback(_.get(this._state, w.path), this._state)
        }
      }
    });
  }

  getState(path) {
    if (path) return _.get(this._state, path);
    return this._state;
  }

  setState(newState) {
    this._state = newState;
    this.triggerAffectedHooks();
  }

  updateState(path, data) {
    _.set(this._state, path, data);
    this.triggerAffectedHooks();
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
