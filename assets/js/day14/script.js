import Vector3D from "../day13/vector3d.js"
import SVGGridGrapher from "../day7/svg-grid-grapher.js"

import BiVariantGrapher from "./bivargrapher.js"
import Ray from "./ray.js"
import Color from "./color.js"

const IMG_PARA_ID = 'imgpara'

const DEFAULT_IMAGE_WIDTH = 400
let targetImageWidth = null
let targetImageHeight = null

let imgParagraph = null

onload = () => {
    imgParagraph = document.getElementById(IMG_PARA_ID)
    if (!imgParagraph) {
        throw 'no ' + IMG_PARA_ID + ' id found on page'
    }
    setImageDimensions()
    initRandomSpheres()
    imgParagraph.innerHTML = ''
    const gridder = new SVGGridGrapher()
    const grapher = new BiVariantGrapher(gridder,
        targetImageWidth,targetImageHeight,2,
        Math.round(targetImageWidth*0.325),f,2)
    let svgElem = grapher.drawGraph()
    imgParagraph.appendChild(svgElem)
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

let spheres = []

const universalOrigin = new Vector3D(0,0,-30)
const NAVY_BG_COLOR = new Color(0.2,0.2,0.4)

function f(x,y) {
    const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    let leastDist = null
    let leastSphere = null
    spheres.forEach((sph,idx)=>{
        let dist = rayDistToSphere(ray,sph)
        if (dist !== null) {
            if (dist > 0 && (leastDist == null || dist < leastDist)) {
                leastDist = dist
                leastSphere = idx
            }
        }
    })
    if (leastSphere === null) {
        return NAVY_BG_COLOR
    } else {
        return spheres[leastSphere].color
    }
}

function rayDistToSphere(ray,sph) {
    let C = sph.centerV.subt(ray.getOrigin())
    let D = ray.getDirection()
    let CD = C.dot(D)
    let det = CD**2 - D.magnSqr()*(C.magnSqr()-sph.radius**2)
    if (det <= 0) {
        return null
    }
    let detRoot = Math.sqrt(det)
    let k = CD - detRoot
    if (k <= 0) {
        return null
    }
    k /= D.magn()
    return k
}

function initRandomSpheres() {
    spheres = []
    const SPH_COUNT = 20
    for (let i=0;i<SPH_COUNT;i++) {
        const sphere = {
            radius : 2.5,
            centerV : randomCenter(),
            color : randomColor()
        }
        spheres.push(sphere)
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