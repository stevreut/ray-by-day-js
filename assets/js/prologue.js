onload = () => {
    fadeIntoView();
}

function fadeIntoView() {
    const bright0 = 150, brightF = 40;
    const gray0 = 0, grayF = 30;
    const loopCount = 50;
    let n = 0;
    let elemList = document.querySelectorAll("p, h1, h2, p2, .dayh2, i, a, div");
    root = document.documentElement;
    root.style.setProperty("--body-before-filter","grayscale(0%) brightness(150%)");
    for (elem of elemList) {
        elem.style.opacity = 0;
    }
    // After a delay of 1.5 seconds, fade the
    // text content into view and fade the background
    // image to be darker and less saturated over
    // a period of 5 seconds.
    setTimeout(()=> {
        let timer = setInterval(()=>{
            n++;
            if (n > loopCount) {
                clearInterval(timer);
            } else {
                let newFilterVal = "grayscale("+Math.round(gray0+(grayF-gray0)*n/loopCount)+"%)";
                newFilterVal += " brightness("+Math.round(bright0+(brightF-bright0)*n/loopCount)+"%)";
                root.style.setProperty("--body-before-filter",newFilterVal);
                let level = n/loopCount;
                for (elem of elemList) {
                    let isOk = true;
                    try {
                        elem.style.opacity = level;
                    } catch (err) {
                        console.error('bad load for elem', elem, ' with ',
                            ' error = ', err);
                        isOk = false;
                    }
                }
            }
        },100);
    },1500);
}