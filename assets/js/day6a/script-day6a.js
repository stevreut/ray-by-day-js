import BiVariantGrapher from "./bivargrapher.js"
import GridGraph from "./gridgraph.js"
import TextGraph from "./textgraph.js"

const IMG_ID = 'svghere'

onload = () => {
    console.log('script 6a invoked at ', new Date())  // TODO - temporary
    const imgParentElem = document.getElementById(IMG_ID)
    if (!imgParentElem) {
        throw 'no ' + IMG_ID + ' id found on page'
    }
    setUpGraphOnPage(imgParentElem)
}

function setUpGraphOnPage(imgParent) {
    imgParent.innerHTML = ''
    const gridder = new GridGraph(30,30,20)  // TODO
    // const gridder = new TextGraph(30,30,20)
    const bvg = new BiVariantGrapher(gridder,30,30,20,12,f,5)  // TODO
    const imgElement = bvg.drawGraph()
    imgParent.appendChild(imgElement)
}

function f(x,y) {
    if (x*x+y*y < 1) {
        return [1,0,0]
    } else {
        return [1,1,1]
    }
}