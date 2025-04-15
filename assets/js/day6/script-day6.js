
import BiVariantGrapher from "./bivargrapher.js"

const svgAnchorID = "svghere"

const PIXELS_WIDTH = 160
const PIXELS_HEIGHT = 120
const PIXEL_SIZE = 5  // One VIRTUAL pixel = 5 screen pixels

let functionToGraph = 1

onload = () => {
    const svgAnchor = document.getElementById(svgAnchorID)
    if (!svgAnchor) {
        throw 'no ' + svgAnchorID + 'id found on page'
    }
    svgAnchor.innerHTML = ''
    let svgElem = createSvgElemAt(svgAnchor)
    svgAnchor.appendChild(svgElem)
    const changeButton = document.getElementById("chgbtn")
    if (changeButton) {
        changeButton.addEventListener('click',()=>{
            functionToGraph = 3-functionToGraph
            svgAnchor.innerHTML = ''
            let svgElem = createSvgElemAt(svgAnchor)
            svgAnchor.appendChild(svgElem)
        })
    }
}

function createSvgElemAt(anch) {
    let graph = new BiVariantGrapher(200,150,4,60.2,null,5)
    graph.setFunction(functionToGraph === 2?localFunc2:localFunc1)
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

let lightVector = [5,3,3]

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
        return [0.2,0.2*1.2,0.2*1.6] 
    } else {
        let m = sum*0.07+0.2
        return [m,m*1.2,m*1.6]
    }
}

