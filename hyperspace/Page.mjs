import {assert} from 'utils/assert.mjs';

// Page 

function createPage(app, scope) {
  const { schema } = app;
  const page = {
    onError(handler) { scope.onError = handler },
    onAction(handler) { scope.onAction = handler },
    addTemplate(name, template) { 
      scope.sendAction({ action: "addTemplate", name, template }); 
    },
    sendHotTemplateUpdate(name, delta) {
      scope.sendAction({ action: "updateTemplate", name, delta });
    },
    sendHotStyleUpdate(name, delta) {
      scope.sendAction({ action: "addStyle", name, delta });
    },
    initialize() {
      const { templates, styles } = app.staticLoaders;
      styles.forEach(s => page.sendHotStyleUpdate(s.name, s.loader.getContent()));
      templates.forEach(t => page.addTemplate(t.name, t.loader.getContent()));
      // 1. Send page state
      scope.sendState(app.state);
      // 2. then the views
      page.render(schema.render),
      // ready!
      scope.sendState({ appReady: true });
    },
    render(views) {
      assert(Array.isArray(views), "it must be an array");
      views.forEach(v => {
        const { data, target, template } = v;
        scope.sendAction({ action: "render", data, target, template });
      });
    },
    updateState(partial) {
      scope.sendState(partial)
    },
  }; // page
  return page;
}

export default createPage;
