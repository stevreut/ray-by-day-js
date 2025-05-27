import Vector3D from "./vector3d.js"
import BiVariantGrapher from "../day6/bivargrapher.js"

const svgAnchorID = 'svghere'

onload = () => {
    const svgAnchor = document.getElementById(svgAnchorID)
    if (!svgAnchor) {
        throw 'no ' + svgAnchorID + 'id found on page'
    }
    svgAnchor.innerHTML = ''
    const lightingVector = getLightingVector(true)
    let svgElem = createLitSvgElemAt(svgAnchor,lightingVector)
    svgAnchor.appendChild(svgElem)
    const controlDiv = document.getElementById("controldiv")
    if (controlDiv) {
        controlDiv.addEventListener('input',(ev)=>{
            const targetId = ev.target.id
            if (targetId.slice(1) === 'Ranger') {
                const prefix = targetId[0]
                if ('xyz'.includes(prefix)) {
                    const numbBox = document.getElementById(prefix+'Rnumb')
                    if (numbBox) {
                        numbBox.value = ev.target.value
                    }
                }
            }
        })
        controlDiv.addEventListener('change',(ev)=>{
            const targetId = ev.target.id 
            if (targetId.slice(1) === 'Ranger') {
                const prefix = targetId[0]
                if ('xyz'.includes(prefix)) {
                    const outputElem = document.getElementById('lightvect')
                    outputElem.value = getLightingVector(false)
                    outputElem.classList.add('outputhilite')
                    setInterval(()=>outputElem.classList.remove('outputhilite'),800)
                    svgAnchor.innerHTML = ''
                    const lightingVector = getLightingVector(true)
                    let svgElem = createLitSvgElemAt(svgAnchor,lightingVector)
                    svgAnchor.appendChild(svgElem)
                } else {
                    console.error('What is id ' + id + '?')
                }
            }
        })
    }
}

function getLightingVector(doResize) {
    const x = rectifyRanger('x')
    const y = rectifyRanger('y')
    const z = rectifyRanger('z')
    const workingVector = new Vector3D(x,y,z)
    // const workingVector = new Vector3D(1,2,3) // TODO
    if (doResize) {
        const k = 1/workingVector.magn()
        const resultVector = workingVector.scalarMult(k)
        return resultVector
    } else {
        return workingVector
    }
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
            let skyVector = new Vector3D(x/8,y/8,-1)
            skyVector = skyVector.scalarMult(1/skyVector.magn())
            const skyDotProd = skyVector.dot(lightVector)
            const k = ((skyDotProd+1)/2)**10*7
            return [0.03*k,0.1*k,0.3*k]
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

