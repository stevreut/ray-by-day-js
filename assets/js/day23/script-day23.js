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
const FRAME_STATUS_ID = 'framestat'

const ACTUAL_WIDTH = 600
const ACTUAL_HEIGHT = Math.round(ACTUAL_WIDTH*0.75)
const PIXEL_SIZE = 6
const ANTI_ALIAS = 2

const FRAME_COUNT = 450
const FRAME_INTERVAL = 0.05

const universalOrigin = new Vector3D(-17,5,7.5)

let goAgainButton = null
let imgParagraph = null
let durationElem = null
let frameStatusPara = null

let buttonEnabled = true

let canvasArray = []

onload = () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        frameStatusPara = linkElement(FRAME_STATUS_ID)
        makeAnimationIfEnabled()
        goAgainButton.addEventListener('click',()=>makeAnimationIfEnabled())
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())  // TODO
    }
    async function makeAnimationIfEnabled() {
        if (buttonEnabled) {
            enableButton(false)
            initEnvironment()
            canvasArray = []
            const startTime = new Date()
            for (let frameNo=0;frameNo<FRAME_COUNT;frameNo++) {
                let t = frameNo*FRAME_INTERVAL
                positionCameraForFrameAtTime(t)
                let canv = await processSingleImage(imgParagraph,durationElem)
                canvasArray.push(canv)
                await new Promise(requestAnimationFrame);
                frameStatusPara.textContent = 'Complete: ' + (frameNo+1) + ' frames out of ' + FRAME_COUNT

            }
            const finTime = new Date()
            const duration = (finTime.getTime()-startTime.getTime())/1000
            console.log('duration for canvases = ', duration, ' seconds')
            enableButton(true)
            for (let i=0;i<canvasArray.length*5;i++) {
                let canv = canvasArray[i%canvasArray.length]
                setTimeout(()=>{
                    imgParagraph.innerHTML = ''
                    imgParagraph.appendChild(canv)
                },i*FRAME_INTERVAL*1000)
            }
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
    return await grapher.drawGraph()
}

let optEnv = null

function positionCameraForFrameAtTime(t) {
    const deltaT = 1e-6
    const deltaMult = 1/(2*deltaT)
    // const endTime = 30
    // const R = 60
    // const V = 0.75
    // const TH = 0.5
    const originVector = posVec(t)
    const dirVector = velocVec(t)
    const cameraRay = new Ray(
        originVector,
        dirVector
    )
    optEnv.setCamera(cameraRay,0,10)
    //
    function posVec(t) {
        const SZ = 4.5
        const th1 = t*2*Math.PI/(FRAME_COUNT*FRAME_INTERVAL)
        const th2 = th1*2
        // Vector path traced out by the following is a Lemiscate of Bernoulli
        // ( https://en.wikipedia.org/wiki/Lemniscate_of_Bernoulli#:~:text=In%20geometry%2C%20the%20lemniscate%20of,and%20to%20the%20%E2%88%9E%20symbol. )
        // which is basically a figure-8 path.  In this case it is slightly canted to give the elevation some
        // variety.
        // The parametric equations used in this case do NOT yield constant velocity.
        const x = Math.cos(th1)*SZ
        const y = Math.sin(th2)*SZ*0.5
        const z = x*0.2
        return new Vector3D(x,y,z)
    }
    function velocVec(t) {
        // Use an approximation of the derivative of the position vector
        // (posVec) to determine the velocity vector.  The magnitude of this
        // vector would be the speed of the camera but is irrelevant for our
        // purposes; it is the direction of the vector that is important since it
        // will determine in what direction the camera is pointed - always forward
        // with the motion of the camera.
        return posVec(t+deltaT).subt(posVec(t-deltaT)).scalarMult(deltaMult)
    }
}

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    initRandomShapes()
    optEnv.addOpticalObject(new Plane(-7.5,12,5))
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
    const TARGET_SHAPE_COUNT = 20
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