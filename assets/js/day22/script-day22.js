import Vector3D from "../day19/vector3d.js"
import BiVariantGrapher from "../day19/bivargrapher.js"
import Ray from "../day19/ray.js"
import ReflectiveSphere from "../day19/reflective-sphere.js"
import CanvasGridder from "../day19/canvas-gridder.js"
import Sphere from "../day19/sphere.js"
import Sky from "../day21/sky.js"
import OpticalEnvironment from "../day21/optical-env.js"
import Plane from "../day21/plane.js"
import RefractiveSphere from "../day21/refractive-sphere.js"
import Triangle from "./triangle.js"


const IMG_PARA_ID = 'imgpara'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

const ACTUAL_WIDTH = 800 // TODO
const ACTUAL_HEIGHT = Math.round(ACTUAL_WIDTH*0.75)
const PIXEL_SIZE = 2  // TODO
const ANTI_ALIAS = 3  // TODO

let buttonEnabled = false

onload = () => {
    try {
        let imgParagraph = document.getElementById(IMG_PARA_ID)
        let goAgainButton = document.getElementById(REPEAT_BUTTON_ID)
        let durationElem = document.getElementById(DURATION_TEXT_ID)
        if (!imgParagraph) {
            throw 'no ' + IMG_PARA_ID + ' id found on page'
        }
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

function processImage(imgParagraph,durationElem) {
    initEnvironment()
    imgParagraph.innerHTML = ''
    const gridder = new CanvasGridder()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(ACTUAL_WIDTH/PIXEL_SIZE),
        Math.floor(ACTUAL_HEIGHT/PIXEL_SIZE),
        PIXEL_SIZE, 
        ACTUAL_HEIGHT/PIXEL_SIZE*0.33,
        f,ANTI_ALIAS
    )
    let canvasElem = grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.appendChild(canvasElem)
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
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
    optEnv.addOpticalObject(new Triangle(
        new Vector3D(1,1,1),
        new Vector3D(2,2,2),
        new Vector3D(3,3,4)
    ))
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
    const SPH_COUNT = 4
    const lightV = new Vector3D(0,0,1)
    let sphereCount = 0
    let rejectCount = 0
    const sphTempArray = []
    while (sphereCount < SPH_COUNT) {
        const ctrV = randomCenter()
        const radius = 1
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
            if (sphereCount < 1) {
                sphere = new ReflectiveSphere(ctrV,radius,randomColor(0.5,0.7))
            } else if (sphereCount < 2) {
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
    return arr
}