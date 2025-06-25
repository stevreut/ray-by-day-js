import GridGraph from "./gridgraph.js"
import { innerPixelWidth } from "../utils/dom-utils.js"

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
    let virtualPixelSize = 4
    if (anch.parentElement && anch.parentElement.clientWidth > 0) {
        // Get the container (imgdiv) that contains the anchor
        const container = anch.parentElement;
        
        // Calculate content width excluding padding using the utility function
        const contentWidth = innerPixelWidth(container);
        
        // Calculate virtual pixel size based on content width
        // Using 50 as the grid width (from GridGraph constructor)
        virtualPixelSize = Math.max(virtualPixelSize, Math.floor(contentWidth / 50));
    }
    let gridGraph = new GridGraph(50,37,virtualPixelSize,'#000000','#444444')
    // Draw a magenta parabola
    for (let x=0;x<50;x++) {
        let y = x*x
        y *= 36/50/50
        y = 36 - Math.round(y)
        gridGraph.putPixel(x,y,255,0,255)
    }
    // Draw a lime green circle
    const R = 17
    for (let theta=0;theta<=2*Math.PI;theta+=0.015) {
        let x = Math.round((Math.cos(theta)+1.5)*R)
        let y = Math.round((Math.sin(theta)+1.07)*R)
        gridGraph.putPixel(x,y,0,255,0)
    }
    // Draw a square pixel-by-pixel with a smooth gradient of colors
    const SQR_SIDE = 10
    const gg = 128
    for (let j=0;j<SQR_SIDE;j++) {
        const rr = Math.round(j*255/(SQR_SIDE-1))
        for (let i=0;i<SQR_SIDE;i++) {
            const bb = Math.round(i*255/(SQR_SIDE-1))
            gridGraph.putPixel(i+3,j+5,rr,gg,bb)
        }
    }
    let svgElem = gridGraph.getHTMLElement()
    return svgElem
}


