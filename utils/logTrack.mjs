import chalk from "chalk";

const BASE_HUE = 0;
const HUE_STEP = 20;

const tracks = {};

const validTracks = {
    Serve: true,
    
    HyperApp: true,
    HyperPage: true,
    HyperServer: true,
    
    HyperViewEngine: true,
    HyperSocketServer: true,

    EventManager: true,
};

function getOrCreateTrack(name) {
    if (tracks[name]) return tracks[name]
    const keys = Object.keys(tracks);
    const index = keys.length; 
    const baseHue = BASE_HUE;
    const hueStep = HUE_STEP;
    tracks[name] = {
        index: index,
        hue: baseHue + hueStep * index,
        cnt: 0,
    };
    return tracks[name];
}


// pre-generate tracks so that they fall into the right positions

getOrCreateTrack('HyperApp');
getOrCreateTrack('HyperPage');
getOrCreateTrack('Socket');

getOrCreateTrack('HyperServer');
getOrCreateTrack('HyperSocketServer');
getOrCreateTrack('HyperViewEngine');


let prevLogger;
export default function logTrack(trackName, ...args) {
    const track = getOrCreateTrack(trackName);
    const tabSize = 10;

    const textColor = chalk.hsl(track.hue, 100, 50);
    const headerColor = chalk.bgHsl(track.hue, 100, 50).hex('#fff');

    // print track header
    if (prevLogger !== trackName) {
        console.debug(' '.repeat(tabSize * track.index) + headerColor(trackName.padEnd(tabSize, ' ')));    
        prevLogger = trackName;
    }

    console.debug(
        ' '.repeat(tabSize * track.index) + 
        textColor(args.join(' '))
    );
}