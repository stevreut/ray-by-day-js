
import GridGraph from "./gridgraph.js"

const svgAnchorID = "svghere"

const PIXELS_WIDTH = 160
const PIXELS_HEIGHT = 120
const PIXEL_SIZE = 5  // One VIRTUAL pixel = 5 screen pixels

onload = () => {
    const svgAnchor = document.getElementById(svgAnchorID)
    if (!svgAnchor) {
        throw 'no ' + svgAnchorID + 'id found on page'
    }
    svgAnchor.innerHTML = ''
    let svgElem = createSvgElemAt(svgAnchor)
    svgAnchor.appendChild(svgElem)
}

function createSvgElemAt(anch) {
    let gridGraph = new GridGraph(200,150,4,'#000000')
    // Mark a single cyan pixel
    gridGraph.putPixel(10,20,0,255,255)
    // Draw a magenta parabola
    for (let x=0;x<200;x++) {
        let y = x*x
        y *= 149/200/200
        y = 149 - Math.round(y)
        gridGraph.putPixel(x,y,255,0,255)
    }
    // Draw a lime green circle
    const R = 70
    for (let theta=0;theta<=2*Math.PI;theta+=0.015) {
        let x = Math.round((Math.cos(theta)+1.5)*R)
        let y = Math.round((Math.sin(theta)+1.07)*R)
        gridGraph.putPixel(x,y,0,255,0)
    }
    // Draw a square pixel-by-pixel with a smooth gradient of colors
    const SQR_SIDE = 50
    const gg = 128
    for (let j=0;j<SQR_SIDE;j++) {
        const rr = Math.round(j*255/(SQR_SIDE-1))
        for (let i=0;i<SQR_SIDE;i++) {
            const bb = Math.round(i*255/(SQR_SIDE-1))
            gridGraph.putPixel(i+10,j+15,rr,gg,bb)
        }
    }
    let svgElem = gridGraph.getHTMLElement()
    return svgElem
}


