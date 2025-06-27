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
    
    // Set up event listeners for number inputs
    setupNumberInputListeners()
    
    // Set up event listeners for preset buttons
    setupPresetButtonListeners()
}

function setupNumberInputListeners() {
    const controlDiv = document.getElementById("controldiv")
    if (controlDiv) {
        // Listen for input changes on number inputs
        controlDiv.addEventListener('input', (ev) => {
            const targetId = ev.target.id
            if (targetId.endsWith('Rnumb')) {
                updateVectorDisplay()
                updateSVG()
            }
        })
    }
}

function setupPresetButtonListeners() {
    const presetButtons = document.querySelectorAll('.preset-buttons button')
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const x = button.getAttribute('data-x')
            const y = button.getAttribute('data-y')
            const z = button.getAttribute('data-z')
            
            document.getElementById('xRnumb').value = x
            document.getElementById('yRnumb').value = y
            document.getElementById('zRnumb').value = z
            
            updateVectorDisplay()
            updateSVG()
        })
    })
}

function updateVectorDisplay() {
    const x = document.getElementById('xRnumb').value
    const y = document.getElementById('yRnumb').value
    const z = document.getElementById('zRnumb').value
    const outputElem = document.getElementById('lightvect')
    outputElem.value = `${x}i + ${y}j + ${z}k`
    outputElem.classList.add('outputhilite')
    setTimeout(() => outputElem.classList.remove('outputhilite'), 800)
}

function updateSVG() {
    const svgAnchor = document.getElementById(svgAnchorID)
    svgAnchor.innerHTML = ''
    const lightingVector = getLightingVector(true)
    let svgElem = createLitSvgElemAt(svgAnchor, lightingVector)
    svgAnchor.appendChild(svgElem)
}

function getLightingVector(doResize) {
    const x = getNumberInputValue('x')
    const y = getNumberInputValue('y')
    const z = getNumberInputValue('z')
    const workingVector = new Vector3D(x,y,z)
    // const workingVector = new Vector3D(1,2,3) // TODO
    if (doResize) {
        const k = 1/workingVector.magn()
        const resultVector = workingVector.scalarMult(k)
        return resultVector
    } else {
        return workingVector
    }
    
    function getNumberInputValue(idPrefix) {
        const id = idPrefix + 'Rnumb'
        const numberInputElem = document.getElementById(id)
        if (!numberInputElem) {
            throw 'no element for id ' + id
        }
        let val = numberInputElem.value
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

