import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import ReflectiveSphere from "../day20/reflective-sphere.js"
import BiVariantGrapher from "../day20/bivargrapher.js"
import Sky from "../day22/sky.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import RefractiveSphere from "../day22/refractive-sphere.js"
import GraphicStatusReportBar from "../utils/graph-status-bar.js"
import CanvasGridGrapher from "../day16/canvas-grid-grapher.js"
import { setImageDimensions } from "../utils/dom-utils.js"

import ReflectiveIcosahedron from "./refl-icos.js"


const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

const DEFAULT_IMAGE_WIDTH = 1024
let targetImageWidth = null
let targetImageHeight = null
let PIXEL_SIZE = 2
const ANTI_ALIAS = 5

const universalOrigin = new Vector3D(-13.6,4,6)

let goAgainButton = null
let imgParagraph = null
let durationElem = null
let statusBar = null

let buttonEnabled = true


onload = () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        statusBar = new GraphicStatusReportBar(STATUS_BAR_ID);
        const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
        targetImageWidth = dimensions.targetWidth
        targetImageHeight = dimensions.targetHeight
        insertBlankCanvas()
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
    const gridder = new CanvasGridGrapher()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(targetImageWidth/PIXEL_SIZE),
        Math.floor(targetImageHeight/PIXEL_SIZE),
        PIXEL_SIZE, 
        targetImageHeight/PIXEL_SIZE*0.33,
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
    statusBar.setProgress(frac);
}

let optEnv = null

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    const cameraRay = new Ray(
        universalOrigin,
        universalOrigin.scalarMult(-1)
    )
    optEnv.setCamera(cameraRay,0.3,universalOrigin.magn())
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
    const TARGET_SHAPE_COUNT = 12
    const lightV = new Vector3D(0,0,1)
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.2  // TODO
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter()
        }
        let rando = Math.random();
        if (rando < 0.6) {
            candidateObject.type = 'icos'
        } else if (rando < 0.85) {
            candidateObject.type = 'spht'
        } else {
            candidateObject.type = 'sphm'
        }
        if (candidateObject.type === 'icos') {
            candidateObject.radius = Math.random()*0.8+0.7
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
                obj = new ReflectiveIcosahedron(shape.center,shape.radius,randomColor(0.6,0.8))
                break;
            case 'sphm':
                obj = new ReflectiveSphere(shape.center,shape.radius,randomColor(0.5,0.6))
                break;
            case 'spht':
                obj = new RefractiveSphere(shape.center,shape.radius,randomColor(),1.5)
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
    return new Color(arr)
}