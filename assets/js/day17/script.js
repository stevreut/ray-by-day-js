import Vector3D from "../day13/vector3d.js"
import GridGraph from "../day7/gridgraph.js"
import BiVariantGrapher from "../day14/bivargrapher.js"
import Ray from "../day14/ray.js"
import Color from "../day14/color.js"
import OpticalEnvironment from "./optical-env.js"
import Sphere from "../day15/sphere.js"
import Plane from "./plane.js"

const IMG_PARA_ID = 'imgpara'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

const DEFAULT_IMAGE_WIDTH = 800
let targetImageWidth = null
let targetImageHeight = null

let imgParagraph = null

onload = () => {
    try {
        imgParagraph = document.getElementById(IMG_PARA_ID)
        let goAgainButton = document.getElementById(REPEAT_BUTTON_ID)
        let durationElem = document.getElementById(DURATION_TEXT_ID)
        if (!imgParagraph) {
            throw 'no ' + IMG_PARA_ID + ' id found on page'
        }
        setImageDimensions()
        if (!goAgainButton) {
            throw 'no ' + REPEAT_BUTTON_ID + ' id found on page'
        }
        processImage(imgParagraph,durationElem)
        goAgainButton.addEventListener('click',()=>processImage(imgParagraph,durationElem))
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

function processImage(imgParagraph,durationElem) {
    initEnvironment()
    imgParagraph.innerHTML = ''
    const gridder = new GridGraph()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(gridder,targetImageWidth,targetImageHeight,1,
        Math.round(targetImageWidth*0.325),f,2)
    let svgElem = grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.appendChild(svgElem)
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
}

const universalOrigin = new Vector3D(9,-22.5,22.5)

let optEnv = null  // TODO

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    const cameraRay = new Ray(
        universalOrigin,
        universalOrigin.scalarMult(-1)
    )
    optEnv.setCamera(cameraRay)
    initRandomSpheres()
    optEnv.addOpticalObject(new Plane(-3))
}

function f(x,y) {
    if (!optEnv) {
        throw 'optEnv not initiated'
    }
    const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    return optEnv.colorFromXY(x,y)
}

function initRandomSpheres() {
    const SPH_COUNT = 25
    const lightV = randomLightDirection()
    for (let i=0;i<SPH_COUNT;i++) {
        let sphere = new Sphere(randomCenter(),(Math.random()+1)*1.125,randomColor(),lightV)
        optEnv.addOpticalObject(sphere)
    }
    //
    function randomLightDirection() {
        let arr = []
        for (let i=0;i<3;i++) {
            arr.push((Math.random()-0.5)*2)
        }
        arr[2]+=0.75
        let vect = new Vector3D(arr)
        if (vect.magnSqr() === 0) {
            return randomLightDirection()  // Note recursion
        } else {
            vect = vect.normalized()
            return vect
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

function randomColor() {
    let arr = []
    for (let i=0;i<3;i++) {
        arr.push(Math.round(Math.random()*120+120)/255)
    }
    return new Color(arr)
}