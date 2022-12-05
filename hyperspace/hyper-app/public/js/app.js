/* eslint-disable no-undef */
function showMessages() {

}

function app(h) {

    debugger

    h.state.addHook('', (state) => {
        debugger
        logInfo('app.js', 'state:', JSON.stringify(state, null, ' '));
    });
    
    logInfo('app.js', 'state:', JSON.stringify(h.state, null, ' '));

}

