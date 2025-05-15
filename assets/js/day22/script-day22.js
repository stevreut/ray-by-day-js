import Vector3D from "../day19/vector3d.js"
import Ray from "../day19/ray.js"
import ReflectiveSphere from "../day19/reflective-sphere.js"
import CanvasGridder from "../day19/canvas-gridder.js"
import Sphere from "../day19/sphere.js"
import Sky from "../day21/sky.js"
import OpticalEnvironment from "../day21/optical-env.js"
import Plane from "../day21/plane.js"
import RefractiveSphere from "../day21/refractive-sphere.js"

import ReflectiveIcosahedron from "./refl-icos.js"
import BiVariantGrapher from "./bivargrapher.js"


const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

const ACTUAL_WIDTH = 600
const ACTUAL_HEIGHT = Math.round(ACTUAL_WIDTH*0.75)
const PIXEL_SIZE = 1
const ANTI_ALIAS = 4

const universalOrigin = new Vector3D(-17,5,7.5)

let statBarElem = null
let goAgainButton = null
let imgParagraph = null
let durationElem = null

let buttonEnabled = true


onload = () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        statBarElem = linkElement(STATUS_BAR_ID)
        makeImageIfEnabled()
        goAgainButton.addEventListener('click',()=>makeImageIfEnabled())
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())  // TODO
    }
    function makeImageIfEnabled() {
        if (buttonEnabled) {
            enableButton(false)
            setTimeout(async ()=>{
                await processImage(imgParagraph,durationElem)
                enableButton(true)
            },0)
        }
    }
}

function linkElement(id) {
    let elem = document.getElementById(id)
    if (!elem) {
        throw 'no ' + id + ' id found on page'
    }
    return elem
}

function enableButton(doEnable) {
    if (doEnable === null || doEnable === true) {
        buttonEnabled = true
        goAgainButton.disabled = false
        goAgainButton.classList.remove('btndisabled')
    } else {
        buttonEnabled = false
        goAgainButton.disabled = true
        goAgainButton.classList.add('btndisabled')
    }
}

async function processImage(imgParagraph,durationElem) {
    initEnvironment()
    durationElem.textContent = ''
    const gridder = new CanvasGridder()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(ACTUAL_WIDTH/PIXEL_SIZE),
        Math.floor(ACTUAL_HEIGHT/PIXEL_SIZE),
        PIXEL_SIZE, 
        ACTUAL_HEIGHT/PIXEL_SIZE*0.33,
        f,ANTI_ALIAS,
        statusReporterFunction
    )
    let canvasElem = await grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.innerHTML = ''
    imgParagraph.appendChild(canvasElem)
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
}

function statusReporterFunction(frac) {
    if (typeof frac !== 'number') {
        console.error('status is non-number')
    } else {
        let p = Math.round(Math.max(0,Math.min(1,frac))*1000)/10
        p = p.toFixed(1)
        statBarElem.textContent = 'Status: ' + p + '% complete'
        statBarElem.style.width = (p + '%')
    }
}

let optEnv = null

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    const cameraRay = new Ray(
        universalOrigin,
        universalOrigin.scalarMult(-1)
    )
    optEnv.setCamera(cameraRay,0.5,universalOrigin.magn())
    initRandomShapes()
    optEnv.addOpticalObject(new Plane(-7.5,12,2))
    optEnv.addOpticalObject(new Sky())
}

function f(x,y) {
    if (!optEnv) {
        throw 'optEnv not initiated'
    }
    const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    return optEnv.colorFromXY(x,y)
}

function initRandomShapes() {
    const TARGET_SHAPE_COUNT = 25
    const lightV = new Vector3D(0,0,1)
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.2  // TODO
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter()
        }
        let rando = Math.random();
        if (rando < 0.3) {
            candidateObject.type = 'icos'
        } else if (rando < 0.7) {
            candidateObject.type = 'spht'
        } else if (rando < 0.9) {
            candidateObject.type = 'sphm'
        } else {
            candidateObject.type = 'sphf'
        }
        if (candidateObject.type === 'icos') {
            candidateObject.radius = Math.random()*1.4+1
        } else {
            candidateObject.radius = 1
        }
        let hasIntersect = false
        shapeTempArray.forEach(otherShape=>{
            if (!hasIntersect) {
                if (otherShape.center.subt(candidateObject.center).magn() <= 
                        otherShape.radius+candidateObject.radius+MIN_SPACE) {
                    hasIntersect = true
                }
            }
        })
        if (hasIntersect) {
            rejectCount++
        } else {
            shapeTempArray.push(candidateObject)
        }
    }
    const straightUp = new Vector3D(0,0,1)
    shapeTempArray.forEach(shape=>{
        const { type } = shape
        let obj = null
        switch (type) {
            case 'icos':
                obj = new ReflectiveIcosahedron(shape.center,shape.radius,randomColor(0.5,0.6))
                break;
            case 'sphm':
                obj = new ReflectiveSphere(shape.center,shape.radius,randomColor(0.5,0.6))
                break;
            case 'spht':
                obj = new RefractiveSphere(shape.center,shape.radius,randomColor(),1.5)
                break;
            case 'sphf':
                obj = new Sphere(shape.center,shape.radius,randomColor(0.7,0.85),straightUp)
                break;
            default:
                console.error('unexpected shape = ', type, ' - ignored')
                // obj remains null
        }
        if (obj) {
            optEnv.addOpticalObject(obj)
        }
    })
}

function randomCenter() {
    let arr = []
    for (let i=0;i<3;i++) {
        arr.push((Math.random()-0.5)*10)
    }
    let ctr = new Vector3D(arr)
    return ctr
}

function randomColor(lo=0.47,hi=0.94) {
    let arr = []
    for (let i=0;i<3;i++) {
        arr.push(Math.random()*(hi-lo)+lo)
    }
    return arr
}