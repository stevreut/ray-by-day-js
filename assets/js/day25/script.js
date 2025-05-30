import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import ReflectiveSphere from "../day20/reflective-sphere.js"
import CanvasGridder from "../day20/canvas-gridder.js"
import Sphere from "../day20/sphere.js"
import BiVariantGrapher from "../day22/bivargrapher.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import RefractiveSphere from "../day22/refractive-sphere.js"

import ReflectiveIcosahedron from "./refl-icos.js"

import SunnySky from "./sunny-sky.js"

import ReflectiveCube from "./refl-cube.js"
import ReflectiveTetrahedron from "./refl-tetra.js"
import ReflectiveDodecahedron from "./refl-dodeca.js"


const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

const STATUS_CONTAINER_CLASS = 'progress-container'

const DEFAULT_IMAGE_WIDTH = 1024
let targetImageWidth = null
let targetImageHeight = null
let PIXEL_SIZE = 2
const ANTI_ALIAS = 5

let sunVector = null

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
        setImageDimensions()
        insertBlankCanvas()
        makeImageIfEnabled()
        goAgainButton.addEventListener('click',()=>makeImageIfEnabled())
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())
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

function setImageDimensions() {
    const containerWidth = imgParagraph.clientWidth
    if (containerWidth && Number.isInteger(containerWidth) && containerWidth > 10
        && containerWidth <= 600) {
            targetImageWidth = containerWidth
    } else {
            targetImageWidth = DEFAULT_IMAGE_WIDTH
    }
    targetImageHeight = Math.round(targetImageWidth*0.75)
    PIXEL_SIZE = (targetImageWidth<=512?1:2)
}

async function processImage(imgParagraph,durationElem) {
    initEnvironment()
    durationElem.textContent = ''
    const gridder = new CanvasGridder()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(targetImageWidth/PIXEL_SIZE),
        Math.floor(targetImageHeight/PIXEL_SIZE),
        PIXEL_SIZE, 
        targetImageHeight/PIXEL_SIZE*0.33,
        (x,y) => {
            if (!optEnv) {
                throw 'optEnv not initiated'
            }
            return optEnv.colorFromXY(x,y)
        },
        ANTI_ALIAS,
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

function insertBlankCanvas() {
    const canv = document.createElement('canvas')
    if (canv) {
        imgParagraph.innerHTML = ''
        canv.width = targetImageWidth
        canv.height = targetImageHeight
        const localContext = canv.getContext('2d')
        if (localContext) {
            localContext.fillStyle = '#ddd';
            localContext.fillRect(0,0,targetImageWidth,targetImageHeight)
            localContext.fillStyle = '#bbb';
            const currentFont = localContext.font
            const fontParts = currentFont.split(' ')
            const newFont = '36px ' + fontParts.slice(1).join(' ')
            localContext.font = newFont
            localContext.fillText('Image creation in progress...',30,80)
        }
        imgParagraph.appendChild(canv)
    }
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
    sunVector = randomSunDirection()
    optEnv = new OpticalEnvironment()
    const cameraOrigin = new randomCameraPosition()
    const cameraDirection = cameraOrigin.scalarMult(-1)
    const cameraOriginDistance = cameraOrigin.magn()
    const cameraRay = new Ray(
        cameraOrigin,
        cameraDirection
    )
    optEnv.setCamera(cameraRay,0.25,cameraOriginDistance)
    initRandomShapes()
    optEnv.addOpticalObject(new Plane(-7.5,12,2))
    optEnv.addOpticalObject(new SunnySky(sunVector))
}

function initRandomShapes() {
    const TARGET_SHAPE_COUNT = 15
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.2
    const SHAPE_NAMES = 'icos;spht;sphm;sphf;cube;tetr;dode'.split(';')
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter()
        }
        let rando = Math.floor(Math.random()*7)
        candidateObject.type = SHAPE_NAMES[rando]
        candidateObject.radius = 1
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
                obj = new Sphere(shape.center,shape.radius,randomColor(0.7,0.85),sunVector)
                break;
            case 'cube':
                obj = new ReflectiveCube(shape.center,shape.radius*2/Math.sqrt(3),[0.8,0.5,0.5])
                break;
            case 'tetr':
                obj = new ReflectiveTetrahedron(shape.center,shape.radius,[0.5,0.65,0.5])
                break;
            case 'dode':
                obj = new ReflectiveDodecahedron(shape.center,shape.radius,[0.65,0.7,0.8])
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

function randomSunDirection() {
    while (true) {
        const x = Math.random()*2-1
        const y = Math.random()*2-1
        const z = Math.random()*2-1
        if (z >= 0 &&
            x*x + y*y + z*z <= 1 &&
            (x != 0 || y != 0 || z != 0)) {
                return new Vector3D(x,y,z)
        }
    }
}

function randomCameraPosition() {
    const LO_DIST = 5
    const HI_DIST = 20
    const LO_LAT = -15
    const HI_LAT = 70
    const longitude = (Math.random()-0.5)*2*Math.PI
    let latitude = Math.random()**2 // **2 skews towards lower values
    latitude = latitude*(HI_LAT-LO_LAT)+LO_LAT  // camera elevation angle - between LO_LAT and HI_LAT degrees
    latitude *= Math.PI/180 // converted to radians
    let distance = Math.sqrt(Math.random())  // sqrt skews towards higher values, still between 0 and 1
    distance *= (HI_DIST-LO_DIST)+LO_DIST  // camera distance - between LO_DIST and HI_DIST
    const z = Math.sin(latitude)*distance 
    const cosDist = Math.cos(latitude)*distance
    const x = Math.cos(longitude)*cosDist
    const y = Math.sin(longitude)*cosDist
    const vec = new Vector3D(x,y,z)
    return vec
}