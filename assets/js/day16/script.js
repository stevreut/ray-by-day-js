import Vector3D from "../day13/vector3d.js"
import CanvasGridGrapher from "./canvas-grid-grapher.js"
import BiVariantGrapher from "../day14/bivargrapher.js"
import Ray from "../day14/ray.js"
import Color from "../day14/color.js"
import ShadowedSphere from "./shadowed-sphere.js"
import { innerPixelWidth } from "../utils/dom-utils.js"

const IMG_PARA_ID = 'imgpara'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

const DEFAULT_IMAGE_WIDTH = 800
let targetImageWidth = null
let targetImageHeight = null

let imgParagraph = null

let modeIsRandom = true

onload = () => {
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
}

function setImageDimensions() {
    const containerWidth = innerPixelWidth(imgParagraph)
    targetImageWidth = Math.max(100,Math.min(DEFAULT_IMAGE_WIDTH,containerWidth))
    targetImageHeight = Math.round(targetImageWidth*0.75)
}

function processImage(imgParagraph,durationElem) {
    initRandomSpheres()
    imgParagraph.innerHTML = ''
    const gridder = new CanvasGridGrapher()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(gridder,
        targetImageWidth,targetImageHeight,
        1,Math.round(targetImageWidth*0.325),f,3)
    let svgElem = grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.appendChild(svgElem)
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
}

let spheres = []

const universalOrigin = new Vector3D(0,0,-30)
const DARK_BLUE_BG_COLOR = new Color(0.1,0.1,0.3)

function f(x,y) {
    const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    let leastDist = null
    let leastSphere = null
    spheres.forEach((sph,idx)=>{
        let dist = sph.interceptDistance(ray)
        if (dist !== null) {
            if (dist > 0 && (leastDist == null || dist < leastDist)) {
                leastDist = dist
                leastSphere = idx
            }
        }
    })
    if (leastSphere === null) {
        return DARK_BLUE_BG_COLOR
    } else {
        return spheres[leastSphere].handle(ray)
    }
}

function initRandomSpheres() {
    const SPH_COUNT = 25
    spheres = []
    const lightV = randomLightDirection()
    if (modeIsRandom) {
        for (let i=0;i<SPH_COUNT;i++) {
            let sphere = new ShadowedSphere(randomCenter(),(Math.random()+1)*1.125,randomColor(),lightV,spheres)
            spheres.push(sphere)
        }
    } else {
        for (let i=0;i<SPH_COUNT;i++) {
            let sphere = new ShadowedSphere(orderlyCenter(i),2,randomColor(),lightV,spheres)
            spheres.push(sphere)
        }
    }
    modeIsRandom = !modeIsRandom
    //
    function randomLightDirection() {
        let arr = []
        for (let i=0;i<3;i++) {
            arr.push((Math.random()-0.5)*2*(i<2?1:0.5))
        }
        let vect = new Vector3D(arr)
        if (vect.magnSqr === 0) {
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

function orderlyCenter(n) {
    n = Math.round(n)
    n = n%25
    let theta = (n+0.3)*Math.PI*2/25
    let x = Math.cos(theta)*7
    let baseSin = Math.sin(theta)*7
    let z = baseSin*12/13
    let y = baseSin*5/13
    return new Vector3D(x,y,z)
}

function randomColor() {
    let arr = []
    for (let i=0;i<3;i++) {
        arr.push(Math.round(Math.random()*70+170)/255)
    }
    return new Color(arr)
}