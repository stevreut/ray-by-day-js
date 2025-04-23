import Vector3D from "../day17/vector3d.js"
import GridGraph from "../day6a/gridgraph.js"
import BiVariantGrapher from "../day6a/bivargrapher.js"
import Ray from "../day17/ray.js"
import OpticalEnvironment from "../day17/optical-env.js"
import ReflectiveSphere from "../day17/reflective-sphere.js"
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
        initEnvironment(imgParagraph)
        processImage(imgParagraph,durationElem,cameraRightOrigin)
        processImage(imgParagraph,durationElem,cameraLeftOrigin)
        goAgainButton.addEventListener('click',()=>{
            initEnvironment(imgParagraph)
            processImage(imgParagraph,durationElem,cameraRightOrigin)
            processImage(imgParagraph,durationElem,cameraLeftOrigin)
        })
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())  // TODO
    }
}

function processImage(imgParagraph,durationElem,cameraOrigin) {
    // initEnvironment()
    // imgParagraph.innerHTML = ''
    const cameraRay = new Ray(
        cameraOrigin,
        cameraOrigin.scalarMult(-1)
    )
    optEnv.setCamera(cameraRay)
    const gridder = new GridGraph()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(gridder,400,400,1,100,f,2)
    let svgElem = grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.appendChild(svgElem)
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
}

const cameraRightOrigin = new Vector3D(10,-15,15)
const cameraLeftOrigin = new Vector3D(8,-16.15,15)

let optEnv = null

function initEnvironment(imgParagraph) {
    imgParagraph.innerHTML = ''
    optEnv = new OpticalEnvironment()
    initRandomSpheres()
    optEnv.addOpticalObject(new Plane(-7.5))
}

function f(x,y) {
    if (x*x+y*y >= 3.25) {
        return [1,1,1]
    }
    if (!optEnv) {
        throw 'optEnv not initiated'
    }
    const ray = new Ray(cameraLeftOrigin,new Vector3D(x,y,4))
    return optEnv.colorFromXY(x,y)
}

function initRandomSpheres() {
    const SPH_COUNT = 12
    const lightV = randomLightDirection()
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
            const sphere = new ReflectiveSphere(ctrV,radius,randomColor(),lightV)
            optEnv.addOpticalObject(sphere)
            sphTempArray.push({
                center: ctrV,
                radius: radius 
            })
            sphereCount++
        }
    }
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
    return arr
}