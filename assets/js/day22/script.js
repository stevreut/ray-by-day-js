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

const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

const STATUS_CONTAINER_CLASS = 'progress-container'

const DEFAULT_IMAGE_WIDTH = 1024
let targetImageWidth = null
let targetImageHeight = null
const PIXEL_SIZE = 1
const ANTI_ALIAS = 4

let buttonEnabled = false

let imgParagraph = null
let statBarElem  = null

onload = () => {
    try {
        imgParagraph = document.getElementById(IMG_PARA_ID)
        let goAgainButton = document.getElementById(REPEAT_BUTTON_ID)
        let durationElem = document.getElementById(DURATION_TEXT_ID)
        statBarElem = document.getElementById(STATUS_BAR_ID)
        if (!imgParagraph) {
            throw 'no ' + IMG_PARA_ID + ' id found on page'
        }
        setImageDimensions()
        insertBlankCanvas()
        if (!goAgainButton) {
            throw 'no ' + REPEAT_BUTTON_ID + ' id found on page'
        }
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
    if (typeof frac !== 'number') {
        console.error('status is non-number')
    } else {
        let p = Math.round(Math.max(0,Math.min(1,frac))*1000)/10
        p = p.toFixed(1)
        statBarElem.textContent = 'Status: ' + p + '% complete'
        statBarElem.style.width = (p + '%')
    }
}

const universalOrigin = new Vector3D(10,-15,6)

let optEnv = null

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    const cameraRay = new Ray(
        universalOrigin,
        universalOrigin.scalarMult(-1)
    )
    optEnv.setCamera(cameraRay,0.5,universalOrigin.magn())
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