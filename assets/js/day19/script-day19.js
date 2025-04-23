import Vector3D from "../day17/vector3d.js"
import GridGraph from "../day6a/gridgraph.js"
import BiVariantGrapher from "../day6a/bivargrapher.js"
import Ray from "../day17/ray.js"
import OpticalEnvironment from "../day17/optical-env.js"
// import ReflectiveSphere from "../day17/reflective-sphere.js"  // TODO - can delete this line?
import RefractiveSphere from "./refractive-sphere.js"
import Plane from "../day17/plane.js"

const IMG_PARA_ID = 'imgpara'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'

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
        processImage(imgParagraph,durationElem)
        goAgainButton.addEventListener('click',()=>processImage(imgParagraph,durationElem))
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())  // TODO
    }
}

function processImage(imgParagraph,durationElem) {
    initEnvironment()
    imgParagraph.innerHTML = ''
    const gridder = new GridGraph()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(gridder,200,150,4,50,f,2)
    let svgElem = grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.appendChild(svgElem)
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
}

const universalOrigin = new Vector3D(10,-15,3)

let optEnv = null

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    const cameraRay = new Ray(
        universalOrigin,
        universalOrigin.scalarMult(-1)
    )
    optEnv.setCamera(cameraRay)
    initRandomSpheres()
    optEnv.addOpticalObject(new Plane(-7.5))
}

function f(x,y) {
    if (!optEnv) {
        throw 'optEnv not initiated'
    }
    const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    return optEnv.colorFromXY(x,y)
}

function initRandomSpheres() {
    const SPH_COUNT = 7
    const lightV = new Vector3D()
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
            const sphere = new RefractiveSphere(ctrV,radius,[0.8,0.5,0.85],lightV)
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