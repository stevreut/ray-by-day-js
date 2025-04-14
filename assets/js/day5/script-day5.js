
// import GridGraph from "../day4/gridgraph.js"
import BiVariantGrapher from "./bivargrapher.js"

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
    let graph = new BiVariantGrapher(200,150,4,60.2)
    graph.setFunction(localFunc)
    let svgElem = graph.drawGraph()
    return svgElem
}

function localFunc(x,y) {
    let insideCircle = (x*x+y*y<=1)
    if (insideCircle) {
        return [(x+1)/2,0.5,(y+1)/2]
    } else {
        return [(5-x)/8,(5-y)/10,0.2]
    }
}


