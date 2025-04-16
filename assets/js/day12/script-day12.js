import Vector3D from "./vector3d.js"
import BiVariantGrapher from "../day6/bivargrapher.js"

const svgAnchorID = 'svghere'

onload = () => {
    const svgAnchor = document.getElementById(svgAnchorID)
    if (!svgAnchor) {
        throw 'no ' + svgAnchorID + 'id found on page'
    }
    svgAnchor.innerHTML = ''
    const lightingVector = getLightingVector()
    let svgElem = createLitSvgElemAt(svgAnchor,lightingVector)
    svgAnchor.appendChild(svgElem)
    const redrawButton = document.getElementById('redrawBtn')
    if (redrawButton) {
        redrawButton.addEventListener('click',()=>{
            svgAnchor.innerHTML = ''
            const lightingVector = getLightingVector()
            let svgElem = createLitSvgElemAt(svgAnchor,lightingVector)
            svgAnchor.appendChild(svgElem)
        })
    }
}

function getLightingVector() {
    const x = rectifyRanger('x')
    const y = rectifyRanger('y')
    const z = rectifyRanger('z')
    const workingVector = new Vector3D(x,y,z)
    // const workingVector = new Vector3D(1,2,3) // TODO
    const k = 1/workingVector.magn()
    const resultVector = workingVector.scalarMult(k)
    return resultVector
    function rectifyRanger(idPrefix) {
        const id = idPrefix + 'Ranger'
        const rangeSliderElem = document.getElementById(id)
        if (!rangeSliderElem) {
            throw 'no element for id ' + id
        }
        let val = rangeSliderElem.value
        try {
            val = parseInt(val)
            if (Number.isNaN(val)) {
                val = 1
            }
        } catch (err) {
            val = 1
        }
        console.log('value for ' + id + ' = ', val, typeof val)
        return val
    }
}

function createLitSvgElemAt(svgAnchor,lightVector) {
    const grapher = new BiVariantGrapher(200,200,3,70,f,3)
    const svg = grapher.drawGraph()
    return svg
    //
    function f(x,y) {
        const SHADE = 0.2
        const r2 = x*x+y*y
        if (r2 >= 1) {
            return [0.03,0.1,0.3]
        } else {
            const z = Math.sqrt(1-r2)
            const surfaceVector = new Vector3D(x,y,z)
            let dotProd = surfaceVector.dot(lightVector)
            dotProd = Math.max(0,dotProd)
            dotProd = dotProd*(1-SHADE)+SHADE
            return [dotProd*1,dotProd*0.3,dotProd*0.05]
        }
    }    
}

