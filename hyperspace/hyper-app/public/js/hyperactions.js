var createHyperActions = function (wsProxy) { 
    const _ws = wsProxy.ws;
    
    let activeTemplate;
    const templates = {};
    
    function isNullish(value) {
      return value === null || value === undefined;
    }
    
    function asArray(d) {
      if (Array.isArray(d)) { return d; }
      return [d];
    }
    
    function useTemplate(name) {
      if (name === "any") { return activeTemplate; }
      const t = templates[name];
      if (!t) { throw new Error("Invalid template name"); }
      return t;
    }
    
    function useStateData(key) {
      if (!Reflect.has(state, key)) { throw new Error("Invalid state key"); }
      const d = state[key];
      if (isNullish(d)) { return []; }
      return asArray(d);
    }
    
    function useRawData(d) {
      if (isNullish(d)) { return []; }
      return asArray(d);
    }
    
    function mergeView(template, data, scope) {
      const re = new RegExp("{(.+?)}", "gmi");
      const matches = [...template.matchAll(re)];
      let view = template.slice(0);
      for (let m of matches) {
        const path = m[1];
        const value = data[path] || scope[path];
        const fullTag = m[0];
        const reFullTag = new RegExp(fullTag, "gmi");
        view = view.replace(reFullTag, value);
      }
      return view;
    }
    
    function tryGet(get) {
      try {
        return get();
      }
      catch (ex) {
        return undefined;
      }
    }

    function getTargetContainer(target) {
      const byId = tryGet(() => document.getElementById(target));
      const byQS = tryGet(() => document.querySelectorAll(target));
      const tgt = byId || byQS;
      if (Array.isArray(tgt) && tgt.length > 1) {
        console.warn('Targeting multiple containers is not implemented.  Rendering into the first one only');
        return tgt[0];
      }
      else {
        return tgt;
      }
    }

    function render({ data, target, template }) {
      try {
        const T = useTemplate(template);
        const container = getTargetContainer(target);
        const items = typeof data === "string" ? useStateData(data) : useRawData(data);
        container.innerHTML = items.map((x, i) => mergeView(T, x, { index: i })).join("");
      } catch (err) {
        console.error(err.message || err);
        ws.send({ action: "error", message: err.message || err });
      }
    }
    
    function addStyle(name, css) {
      if (!css) { return; }
      const css2 = document.createElement("style");
      css2.appendChild(document.createTextNode(css));
      const htmlEl = document.documentElement;
      htmlEl.appendChild(css2);
    }
    
    function handleMessage(data) {
      const { action } = data;
      const payload = data;
      switch (action) {
        case "addStyle":
          addStyle(payload.name, payload.delta);
          break;
        case "addTemplate":
          activeTemplate = payload.template;
          templates[payload.name] = payload.template;
          break;
        case "updateTemplate":
          Object.assign(activeTemplate, payload.delta);
          Object.assign(templates[payload.name], payload.delta);
          break;
        case "render":


          render(payload);
          break;
        default:
          send({ action: "error", message: `Invalid action: ${action}`});
      }
    }

    wsProxy.receive = handleMessage;

    return new function () { 
        Object.assign(this, {
            
        });
        return this; 
    }; 
}; 

