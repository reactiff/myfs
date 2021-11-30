function showMessages() {

}

function app(h) {

    debugger

    h.state.watch('', (state) => {
        console.log('app.js: state -->', state)
    });
    

    console.log(h.state)


}