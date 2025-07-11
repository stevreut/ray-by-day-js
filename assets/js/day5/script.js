import BiVariantGrapher from "./bivargrapher.js"
import { innerPixelWidth } from "../utils/dom-utils.js"

const svgAnchorID = "svghere"

const PIXELS_WIDTH = 96
const PIXELS_HEIGHT = 72

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
    // Calculate pixel size based on container width
    let virtualPixelSize = 4
    if (anch.parentElement && anch.parentElement.clientWidth > 0) {
        const container = anch.parentElement;
        const contentWidth = innerPixelWidth(container);
        virtualPixelSize = Math.max(4, Math.floor(contentWidth / PIXELS_WIDTH));
    }
    
    let graph = new BiVariantGrapher(PIXELS_WIDTH, PIXELS_HEIGHT, virtualPixelSize, PIXELS_HEIGHT*0.4)
    graph.setFunction(localFunc2)
    let svgElem = graph.drawGraph()
    return svgElem
}

function localFunc1(x,y) {
    let insideCircle = (x*x+y*y<=1)
    if (insideCircle) {
        return [(x+1)/2,0.5,(y+1)/2]
    } else {
        return [(5-x)/8,(5-y)/10,0.2]
    }
}

let lightVector = [5,3,1]

function localFunc2(x,y) {
    const r2 = x*x+y*y
    const insideCircle = (r2<=1)
    if (!insideCircle) {
        return [0,0,0]
    }
    const z = Math.sqrt(1-r2)
    const globeVector = [x,y,z]
    let sum = 0
    for (let i=0;i<3;i++) {
        sum += globeVector[i]*lightVector[i]
    }
    if (sum <= 0) {
        return [0.2,0.2,0.2] 
    } else {
        let m = sum*0.1+0.2
        return [m,m*1.1,m*1.2]
    }
}

