import * as Global from './global.js';

export default function splashScreen() {
    var loc = new Image();
    loc.useMap = "../assets/splash.png";
    var img = document.createElement('img')
    img.setAttribute('src', loc.useMap);
    img.setAttribute('style',"height:auto;width:auto;");
    img.style.display = "block";
    img.style.margin = "auto";
    img.style.width = "100%";
    document.body.appendChild(img);
    (async () => {
        await Global.delay(3000);
        document.body.removeChild(img);
    })();
}
