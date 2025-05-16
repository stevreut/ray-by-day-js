import Vector3D from "../day19/vector3d.js"
import Ray from "../day19/ray.js"
import ReflectiveSphere from "../day19/reflective-sphere.js"
import CanvasGridder from "../day19/canvas-gridder.js"
import Sphere from "../day19/sphere.js"
import Sky from "../day21/sky.js"
import OpticalEnvironment from "../day21/optical-env.js"
import Plane from "../day21/plane.js"
import RefractiveSphere from "../day21/refractive-sphere.js"
import BiVariantGrapher from "../day22/bivargrapher.js"



const IMG_PARA_ID = 'imgpara'
const REPEAT_BUTTON_ID = 'rptbtn'

const ACTUAL_WIDTH = 600
const ACTUAL_HEIGHT = Math.round(ACTUAL_WIDTH*0.75)
const PIXEL_SIZE = 4  // TODO - change back to 1 after testing
const ANTI_ALIAS = 3  // TODO - change back to 4 after testing

const universalOrigin = new Vector3D(-17,5,7.5)

let goAgainButton = null
let imgParagraph = null
let durationElem = null

let buttonEnabled = true


onload = () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        makeAnimationIfEnabled()
        goAgainButton.addEventListener('click',()=>makeAnimationIfEnabled())
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())  // TODO
    }
    function makeAnimationIfEnabled() {
        if (buttonEnabled) {
            enableButton(false)
            initEnvironment()
            for (let t=0;t<30;t+=0.2) {
                setTimeout(async ()=>{
                    await positionCameraForFrameAtTime(t)
                    await processSingleImage(imgParagraph,durationElem)
                },t*1000)
            }
            setTimeout(()=>enableButton(true),30000)
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

async function processSingleImage(imgParagraph) {
    const gridder = new CanvasGridder()
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(ACTUAL_WIDTH/PIXEL_SIZE),
        Math.floor(ACTUAL_HEIGHT/PIXEL_SIZE),
        PIXEL_SIZE, 
        ACTUAL_HEIGHT/PIXEL_SIZE*0.33,
        f,ANTI_ALIAS
    )
    let canvasElem = await grapher.drawGraph()
    imgParagraph.innerHTML = ''
    imgParagraph.appendChild(canvasElem)
}

let optEnv = null

function positionCameraForFrameAtTime(t) {
    const endTime = 30
    const R = 40
    const V = 0.5
    const TH = 0.5
    const angle = (endTime-t)/R
    const x = Math.sin(angle)*Math.cos(TH)*R
    const y = Math.sin(angle)*Math.sin(TH)*R
    const z = (1-Math.cos(angle))*R
    const originVector = new Vector3D(x,y,z)
    const vx = -Math.cos(angle)*Math.cos(TH)
    const vy = -Math.cos(angle)*Math.sin(TH)
    const vz = -Math.sin(angle)
    const dirVector = new Vector3D(vx,vy,vz)
    const cameraRay = new Ray(
        originVector,
        dirVector
    )
    optEnv.setCamera(cameraRay,0,10)
}

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    initRandomShapes()
    optEnv.addOpticalObject(new Plane(-7.5,12,2))
    optEnv.addOpticalObject(new Sky())
}

function f(x,y) {
    if (!optEnv) {
        throw 'optEnv not initiated'
    }
    // const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    return optEnv.colorFromXY(x,y)
}

function initRandomShapes() {
    const TARGET_SHAPE_COUNT = 10
    const lightV = new Vector3D(0,0,1)
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.2
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter()
        }
        let rando = Math.random();
        if (rando < 0.7) {
            candidateObject.type = 'spht'
        } else if (rando < 0.93) {
            candidateObject.type = 'sphm'
        } else {
            candidateObject.type = 'sphf'
        }
        if (candidateObject.type === 'icos') {
            candidateObject.radius = Math.random()*1.4+1
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
            case 'sphm':
                obj = new ReflectiveSphere(shape.center,shape.radius,randomColor(0.5,0.6))
                break;
            case 'spht':
                obj = new RefractiveSphere(shape.center,shape.radius,randomColor(),1.5)
                break;
            case 'sphf':
                obj = new Sphere(shape.center,shape.radius,randomColor(0.7,0.85),straightUp)
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