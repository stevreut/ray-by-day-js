import BiVariantGrapher from "./bivargrapher.js"
import GridGraph from "./gridgraph.js"
import TableGridGraph from "./tablegridgraph.js"

const IMG_ID = 'svghere'
const BTN_ID = 'togglebtn'
const TXT_ID = 'gridtxt'

let useTextGridder = true
let gridTypeInput = null

onload = () => {
    const imgParentElem = document.getElementById(IMG_ID)
    if (!imgParentElem) {
        throw 'no ' + IMG_ID + ' id found on page'
    }
    const toggleButton = document.getElementById(BTN_ID)
    if (!toggleButton) {
        throw 'no ' + BTN_ID + ' id found on page'
    }
    gridTypeInput = document.getElementById(TXT_ID)
    if (!gridTypeInput) {
        throw 'no ' + TXT_ID + ' id found on page'
    }
    toggleButton.addEventListener('click',()=>{
        useTextGridder = !useTextGridder
        setUpGraphOnPage(imgParentElem)
    })
    setUpGraphOnPage(imgParentElem)
}

function setUpGraphOnPage(imgParent) {
    imgParent.innerHTML = ''
    const gridder = (useTextGridder?new GridGraph():new TableGridGraph())
    gridTypeInput.value = (useTextGridder?'GridGraph':'TableGridGraph')
    document.getElementById('imgh3').textContent = (useTextGridder?'SVG':'Table') +
        ' dynamically created ...'
    const bvg = new BiVariantGrapher(gridder,30,30,20,4.5,f,3)
    const imgElement = bvg.drawGraph()
    imgParent.appendChild(imgElement)
}

function f(x,y) {
    const inCircle1 = ((x-1)**2+y**2<3)
    const inCircle2 = ((x+0.5)**2+(y+0.86)**2<3)
    const inCircle3 = ((x+0.5)**2+(y-0.86)**2<3)
    return [
        (inCircle1?0.5:1),
        (inCircle2?0.5:1),
        (inCircle3?0.5:1)
    ]
}