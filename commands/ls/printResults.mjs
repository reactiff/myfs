import _ from "lodash";
import chalk from "chalk";
import moment from "moment";

chalk.level = 3;

export function printResults(fsItems, options) {
    const { dir, order } = options;
  
    console.log(chalk.yellow(dir), chalk.white(`(${fsItems.items.length} results)`));
  
    const ch = printColHeaders(fsItems, options);
    
    let cnt = 1;

    fsItems.items.forEach((f) => {
      if (ch.length) {
        const c = ch[1];

        let timeColor;
        const ms = f.stat[c.name];
        const msDiff = Date.now() - ms;
        const ms_day = 86400000 / 4;
        const pct_of_day = msDiff / ms_day;
        const G = 128 - Math.round(128 * pct_of_day);
        
        if (msDiff < ms_day) {
          timeColor = [ 128, 128 + G, 128 ];
        }
        else {
          timeColor = [ 64, 64, 64 ];
        }

        const format = (x) => c.format(c.convert(x))

        const posix = f.path.replace(/\\/g, '/');
        // if (posix.includes('a-server/workspaces/modules/securityController/methods/')) debugger
        
        // const relPosix = '.' + f.path.slice(dir.length);
        
        console.log(
          chalk.gray((cnt++).toString().padEnd(3)),
          f.name.padEnd(ch[0].length, ' '), 
          chalk.rgb(...timeColor)(format(f.stat[c.name])),
          chalk.gray( posix ),
        );
      }
      else {
        console.log(f.fullPath);
      }
    });
  
    console.log("");
    // console.groupEnd();
  }
  
  
  function printColHeaders(fsItems, options) {
    if (options.order.name === 'name') return [];
  
    let order;
    let convert;
    let makeFormat = (l) => (x) => x.toString().padStart(l, ' ');
    switch (options.order.name) {
      case 'size':
        order = 'size';
        convert = (x) => x.toString();
        // makeFormat = (l) => (x) => x.toString().padStart(l, ' ')
        break;
      case 'btime':
        order = 'birthtimeMs'
        convert = (x) => {
          const iso = new Date(x).toISOString()
          return moment(new Date(x)).fromNow(); 
        }
        // makeFormat = (l) => (x) => x.replace('T', ' ').padStart(l, ' ')
        break;
      default:
        order = options.order.name + 'Ms';
        convert = (x) => {
          const iso = new Date(x); //.toISOString()
          return moment(new Date(x)).fromNow(); 
        }
        // makeFormat = (l) => (x) => x.replace('T', ' ').padStart(l, ' ')
    }
    
    const l1 = fsItems.items.reduce((a, item) => Math.max(a, item.name.length), 0);
    const l2 = fsItems.items.reduce((a, item) => {
      const value = convert(item.stat[order]);
      return Math.max(a, value.length)
    }, 0);
    const l3 = fsItems.items.reduce((a, item) => {
      const value = item.path;
      return Math.max(a, value.length)
    }, 0);
  
  
    console.log('#  ', 'Name'.padEnd(l1, ' '), order.padEnd(l2, ' '), 'Path'.padEnd(l3, ' '));
    console.log(
      Array.from({length: 3}, (x, i) => '-').join(''),
      Array.from({length: l1}, (x, i) => '-').join(''),
      Array.from({length: l2}, (x, i) => '-').join(''),
      Array.from({length: l3}, (x, i) => '-').join(''),
    );
  
    return [
      { name: 'name', length: l1 },
      { name: order, length: l2, convert, format: makeFormat(l2) },
      { name: 'path', length: l3, convert, format: makeFormat(l3) },
    ];
  }