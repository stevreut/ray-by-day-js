import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import ReflectiveSphere from "../day20/reflective-sphere.js"
import CanvasGridder from "../day20/canvas-gridder.js"
import Sphere from "../day20/sphere.js"

import BiVariantGrapher from "./bivargrapher.js"
import Sky from "./sky.js"
import OpticalEnvironment from "./optical-env.js"
import Plane from "./plane.js"
import RefractiveSphere from "./refractive-sphere.js"

import GraphicStatusReportBar from "../utils/graph-status-bar.js"

const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'
const F_STOP_INPUT_ID = 'fstopin'
const DEFAULT_F_STOP = 8

const DEFAULT_IMAGE_WIDTH = 800
let targetImageWidth = null
let targetImageHeight = null
const PIXEL_SIZE = 1
const ANTI_ALIAS = 3

let buttonEnabled = false

let imgParagraph = null
let statusBar = null

onload = () => {
    try {
        imgParagraph = document.getElementById(IMG_PARA_ID)
        let fStopInput = document.getElementById(F_STOP_INPUT_ID)
        let goAgainButton = document.getElementById(REPEAT_BUTTON_ID)
        let durationElem = document.getElementById(DURATION_TEXT_ID)
        statusBar = new GraphicStatusReportBar(STATUS_BAR_ID);
        if (!imgParagraph) {
            throw 'no ' + IMG_PARA_ID + ' id found on page'
        }
        setImageDimensions()
        insertBlankCanvas()
        if (!fStopInput) {
            throw 'no ' + F_STOP_INPUT_ID + ' id found on page'
        }
        if (!goAgainButton) {
            throw 'no ' + REPEAT_BUTTON_ID + ' id found on page'
        }
        initEnvironment()
        setCameraFromFStop(fStopInput)
        setTimeout(()=>{
            processImage(imgParagraph,durationElem)
            goAgainButton.disabled = false
            goAgainButton.classList.remove('btndisabled')
            buttonEnabled = true
        },0)
        goAgainButton.addEventListener('click',()=>{
            if (buttonEnabled) {
                buttonEnabled = false
                goAgainButton.disabled = true
                goAgainButton.classList.add('btndisabled')
                setTimeout(()=>{
                    setCameraFromFStop(fStopInput)
                    processImage(imgParagraph,durationElem)
                    goAgainButton.disabled = false
                    goAgainButton.classList.remove('btndisabled')
                    buttonEnabled = true
                },0)
            }
        })
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())  // TODO
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
}

function setCameraFromFStop(fStopInput) {
    const cameraRay = new Ray(
        universalOrigin,
        universalOrigin.scalarMult(-1)
    )
    const fStop = getFStop(fStopInput)
    const focalDistance = universalOrigin.magn()
    const apertureDiameter = focalDistance/fStop
    const apertureRadius = apertureDiameter/2
    optEnv.setCamera(cameraRay,apertureRadius,focalDistance)
}

function getFStop(fStopInput) {
    if (!fStopInput) {
        return DEFAULT_F_STOP
    }
    const inputValue = fStopInput.value
    if (!inputValue) {
        return DEFAULT_F_STOP
    } 
    try {
        let numVal = parseFloat(inputValue)
        if (typeof numVal !== 'number' || Number.isNaN(numVal)) {
            console.error('invalid number from f-stop:')
            console.error('type = ' + typeof numVal)
            return DEFAULT_F_STOP
        }
        numVal = Math.abs(numVal)
        numVal = Math.min(1000,Math.max(0.2,numVal))
        fStopInput.value = numVal
        return numVal
    } catch (err) {
        console.error ('error parsing f-stop:')
        console.err(err)
        return DEFAULT_F_STOP
    }
}

async function processImage(imgParagraph,durationElem) {
    durationElem.textContent = ''
    const gridder = new CanvasGridder()
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

const universalOrigin = new Vector3D(10,-15,6)

let optEnv = null

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    initRandomSpheres()
    optEnv.addOpticalObject(new Plane(-7.5,25,2))
    optEnv.addOpticalObject(new Sky())
}

function f(x,y) {
    if (!optEnv) {
        throw 'optEnv not initiated'
    }
    const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    return optEnv.colorFromXY(x,y)
}

function initRandomSpheres() {
    const SPH_COUNT = 8
    const lightV = new Vector3D(0,0,1)
    let sphereCount = 0
    let rejectCount = 0
    const sphTempArray = []
    while (sphereCount < SPH_COUNT) {
        const ctrV = randomCenter()
        const radius = (Math.random()+1)*1.125
        let hasIntersect = false
        sphTempArray.forEach(tmpSph=>{
            if (!hasIntersect) {
                if (tmpSph.center.subt(ctrV).magnSqr()<=(radius+tmpSph.radius)**2) {
                    hasIntersect = true
                }
            }
        })
        if (hasIntersect) {
            rejectCount++
        } else {
            let sphere = null
            if (sphereCount < 4) {
                sphere = new ReflectiveSphere(ctrV,radius,randomColor(0.5,0.7))
            } else if (sphereCount < 5) {
                sphere = new Sphere(ctrV,radius,randomColor(),lightV)
            } else {
                sphere = new RefractiveSphere(ctrV,radius,randomColor(),1.5)
            }
            optEnv.addOpticalObject(sphere)
            sphTempArray.push({
                center: ctrV,
                radius: radius 
            })
            sphereCount++
        }
    }
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