export let width = window.outerWidth;
export let height = window.outerHeight;
export let centreWidth = width/2;
export let centreHeight = height/2;
export var currentLevel: number;
export var audioContext: AudioContext;
try {
    audioContext = new AudioContext;
} catch (e) {
    console.error(e);
}


export async function delay(ms: number) {
    //return new Promise( resolve => setTimeout(resolve, ms) );
    // Doesn't work with ES5
}
