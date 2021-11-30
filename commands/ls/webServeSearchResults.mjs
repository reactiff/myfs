// import _ from "lodash";
// import { getSearchResultSorter } from "./sort.mjs";
// // import e from "hyperspace/etag.mjs";
// // import { createApp } from "hyperspace/createApp.mjs";
// // import { mergeViewData } from 'hyperspace/server/mergeViewData.mjs';

// function createItemTemplate() {
//   const view = (
//     `<div class="item">` +
//       `<div class="item-header">` +
//         `<div class="item-header-title">{title}</div>` +
//         `<div class="item-header-subtitle">{subtitle}</div>` +
//       `</div>` +
//       `<div class="item-body">` +
//         `<div class="item-body-content">{content}</div>` +
//       `</div>` +
//       `<div class="item-footer">` +
//         `<div class="item-footer-items">{footer}</div>` +
//       `</div>` +
//     `</div>`
//   );
//   return view;
// }

// export function webServeSearchResults(update, scope) {
//   const { opts } = scope;

//   // Sort the results for display
//   update.results.sort(getSearchResultSorter(opts.order.name));
  
//   // Create the hyper app
//   const hyper = createApp({ 
//     name: 'myfs/ls results app',
//     title: 'Search Results',
//     engine: "schema",
//     public: false,
//     routes: {
//       index: {
//         widgets: [
//           {
//             target: 'root',
//             type: 'list',
//             items: update.results,
//             itemTemplate: createItemTemplate()
//           }
//         ],
//       },
//     },
//   });

//   // Open pages by url
//   const pages = {};

//   hyper.onAppStart(app => {

//     debugger
//     app.requestPage('/')
//       .then(page => {
//         pages[page.route] = page;

        

//       });
//   })

//   // hyper.onPageOpen(page => {})

//   // hyper.onConnect(page => {
//     // debugger
//     // page.send('To page. Hey page, this is webbify controller, I will send you some content next');
//   // })

//   // hyper.onMessage((page, ws, message) => {
//   //   console.log('rx:', message);
//   // })

//   // hyper.onDisconnect((page, ws) => {
//   //   console.log('page disconnected:', ws.url);
//   // })

//   // hyper.onPageClose(page => {
//   //   console.log('~ page closed:', page.url);
//   // })

//   // hyper.onAppShutdown(app => {
//   //   console.log('~ app terminated:', app.name);
//   // })
// }

// /**
//   webServeSearchResults
  
//   Used by: LS command only
//   Type:    Service
  
//   This file is dedicated to ls command, with specific purpose to abstract away web page interaction nuances from the ls command, whose job is to traverse the file system and coordinate searches.

//   This is where interaction with the Web page should be implemented
 
//  **/ 

