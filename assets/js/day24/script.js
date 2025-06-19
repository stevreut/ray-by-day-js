import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import ReflectiveSphere from "../day20/reflective-sphere.js"
import CanvasGridder from "../day20/canvas-gridder.js"
import Sphere from "../day20/sphere.js"
import Sky from "../day22/sky.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import RefractiveSphere from "../day22/refractive-sphere.js"
import BiVariantGrapher from "../day20/bivargrapher.js"

import SettingsInputBox from "../utils/settings-input-box.js"

const IMG_PARA_ID = 'imgpara'
const GENERATION_BUTTON_ID = 'genbtn'
const CANCEL_GEN_BUTTON_ID = 'cangenbtn'
const START_BUTTON_ID = 'startbtn'
const PAUSE_BUTTON_ID = 'pausebtn'
const STOP_BUTTON_ID = 'stopbtn'
const RANDOM_ENV_BUTTON_ID = 'randbtn'

const FRAME_STATUS_ID = 'framestat'
const SETTINGS_ID = 'settings'

let ACTUAL_WIDTH = 600
let ACTUAL_HEIGHT = 450
let PIXEL_SIZE = 10
let ANTI_ALIAS = 2

let FRAME_COUNT = 200
let FRAME_INTERVAL = 0.15

let generateButton = null
let cancelButton = null
let startButton = null
let pauseButton = null
let stopButton = null
let randomEnvButton = null

let settingsDiv = null
let imgParagraph = null
let durationElem = null
let frameStatusPara = null

let generationInProgress = false
let canvasArray = []

let timer = null 
let currentFrame = 0

let settingsInputBox = null

onload = () => {
    try {
        linkToElements()
        renderSettingsInputsOnPage()
        enableButton(true,generateButton)
        firstLoadAction()
        generateButton.addEventListener('click',async ()=>await generateAnimation())
        startButton.addEventListener('click',()=>{
            pauseButton.textContent = "Pause Animation"
            enableButton(false,generateButton,startButton,randomEnvButton)
            enableButton(true,pauseButton,stopButton)
            resetTimerLoop()
            rollThroughLoop()
        })
        pauseButton.addEventListener('click',()=>{
            if (timer !== null) {
                clearInterval(timer)
                timer = null
                enableButton(false,stopButton)
                enableButton(true,generateButton,startButton,randomEnvButton)
                pauseButton.textContent = "Restart"
            } else {
                enableButton(false,startButton,generateButton,randomEnvButton)
                enableButton(true,stopButton)
                pauseButton.textContent = "Pause Animation"
                rollThroughLoop()
            }
        })
        stopButton.addEventListener('click',()=>{
            resetTimerLoop()
            enableButton(false,pauseButton,stopButton)
            enableButton(true,generateButton,startButton,randomEnvButton)
        })
        randomEnvButton.addEventListener('click',()=>{
            resetTimerLoop()
            enableButton(false,generateButton,startButton,pauseButton,stopButton,randomEnvButton)
            initEnvironment()
            enableButton(true,generateButton)
        })
        cancelButton.addEventListener('click',()=>{
            enableButton(false,cancelButton,startButton,pauseButton,stopButton)
            generationInProgress = false
            enableButton(true,generateButton,randomEnvButton)
        })
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())  // TODO
    }
}

async function firstLoadAction() {
    await generateAnimation()
    pauseButton.textContent = "Pause Animation"
    enableButton(false,generateButton,startButton,randomEnvButton)
    enableButton(true,pauseButton,stopButton)
    resetTimerLoop()
    rollThroughLoop()
}

function linkToElements() {
    imgParagraph = linkElement(IMG_PARA_ID)
    generateButton = linkElement(GENERATION_BUTTON_ID)
    cancelButton = linkElement(CANCEL_GEN_BUTTON_ID)
    startButton = linkElement(START_BUTTON_ID)
    pauseButton = linkElement(PAUSE_BUTTON_ID)
    stopButton = linkElement(STOP_BUTTON_ID)
    randomEnvButton = linkElement(RANDOM_ENV_BUTTON_ID)
    frameStatusPara = linkElement(FRAME_STATUS_ID)
    settingsDiv = linkElement(SETTINGS_ID)
}

async function generateAnimation() {
    enableButton(false,generateButton,startButton,pauseButton,stopButton,randomEnvButton)
    enableButton(true,cancelButton)
    if (!optEnv) {
        initEnvironment()
    }
    generationInProgress = true
    canvasArray = []
    const startTime = new Date()
    for (let frameNo=0;frameNo<FRAME_COUNT;frameNo++) {
        if (!generationInProgress) {
            canvasArray = []
            frameStatusPara.textContent = 'Animation status: ' + 'cancelled'
            return
        }
        let t = frameNo*FRAME_INTERVAL
        positionCameraForFrameAtTime(t)
        let canv = await processSingleFrame(imgParagraph,durationElem)
        canvasArray.push(canv)
        await new Promise(requestAnimationFrame);
        frameStatusPara.textContent = 'Animation status: ' + (frameNo+1) + ' out of ' + FRAME_COUNT + ' frames completed'
    }
    setTimeout(()=>frameStatusPara.textContent = 'Animation status: all frames calculated',800)
    generationInProgress = false
    const finTime = new Date()
    const duration = (finTime.getTime()-startTime.getTime())/1000
    enableButton(false,cancelButton)
    enableButton(true,generateButton,startButton)
}

function resetTimerLoop() {
    if (timer !== null) {
        clearInterval(timer)
        timer = null
    }
    currentFrame = 0
}

function rollThroughLoop() {
    timer = setInterval(()=>{
        let canv = canvasArray[currentFrame]
        imgParagraph.innerHTML = ''
        imgParagraph.appendChild(canv)
        currentFrame = (currentFrame+1)%canvasArray.length
    },FRAME_INTERVAL*1000)
}

function linkElement(id) {
    let elem = document.getElementById(id)
    if (!elem) {
        throw 'no ' + id + ' id found on page'
    }
    return elem
}

function enableButton(doEnable,...button) {
    button.forEach(btn=>{
        if (doEnable === null || doEnable === true) {
            btn.disabled = false
            btn.classList.remove('btndisabled')
        } else {
            btn.disabled = true
            btn.classList.add('btndisabled')
        }
    })
}

async function processSingleFrame(imgParagraph) {
    const gridder = new CanvasGridder()
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(ACTUAL_WIDTH/PIXEL_SIZE),
        Math.floor(ACTUAL_HEIGHT/PIXEL_SIZE),
        PIXEL_SIZE, 
        ACTUAL_HEIGHT/PIXEL_SIZE*0.33,
        (x,y) => {
            if (!optEnv) {
                throw 'optEnv not initiated'
            }
            return optEnv.colorFromXY(x,y)
        },
        ANTI_ALIAS
    )
    return await grapher.drawGraph()
}

let optEnv = null

function positionCameraForFrameAtTime(t) {
    const deltaT = 1e-6
    const deltaMult = 1/(2*deltaT)
    const originVector = posVec(t)
    const dirVector = velocVec(t)
    const cameraRay = new Ray(
        originVector,
        dirVector
    )
    optEnv.setCamera(cameraRay,0,10)
    //
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

function posVec(t) {
    const SZ = 3.5
    const th1 = t*2*Math.PI/(FRAME_COUNT*FRAME_INTERVAL)
    const th2 = th1*2
    // Vector path traced out by the following is a Lemiscate of Bernoulli
    // ( https://en.wikipedia.org/wiki/Lemniscate_of_Bernoulli )
    // which is basically a figure-8 path.  In this case it is slightly canted to give the elevation some
    // variety.
    // The parametric equations used in this case do NOT yield constant velocity.
    const x = Math.cos(th1)*SZ
    const y = Math.sin(th2)*SZ*0.5
    const z = x*0.2
    return new Vector3D(x,y,z)
}

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    initRandomShapes()
    optEnv.addOpticalObject(new Plane(-7.5,12,5))
    optEnv.addOpticalObject(new Sky())
}

function initRandomShapes() {
    const TARGET_SHAPE_COUNT = 20
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
        candidateObject.radius = 1
        let hasIntersect = false
        shapeTempArray.forEach(otherShape=>{
            if (!hasIntersect) {
                if (otherShape.center.subt(candidateObject.center).magn() <= 
                        otherShape.radius+candidateObject.radius+MIN_SPACE) {
                    hasIntersect = true
                }
            }
        })
        if (!hasIntersect) {
            if (intersectsCameraPath(candidateObject)) {
                hasIntersect = true
            }
        }
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

let pathTrace = null

function createPathTrace() {
    pathTrace = []
    for (let i=0;i<100;i++) {
        const t = i/100*FRAME_COUNT*FRAME_INTERVAL
        pathTrace.push(posVec(t))
    }   
}

function intersectsCameraPath(obj) {
    if (!pathTrace) {
        createPathTrace()
        if (!pathTrace) {
            throw 'unable to create path trace'
        }
    }
    const { center, radius } = obj
    if (!(center instanceof Vector3D) || typeof radius !== 'number') {
        console.error('ignoring object with unexpected attributes')
        return true
    }
    let isIntersect = false
    pathTrace.forEach(pctr=>{
        if (!isIntersect) {
            if (center.subt(pctr).magn() <= radius+0.1) {
                isIntersect = true
            }
        }
    })
    return isIntersect
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

function renderSettingsInputsOnPage() {
    const inputList = [
        {
            id: 'imgwid',
            label: 'Width (pixels)',
            min: 10, max: 1024,
            value: ACTUAL_WIDTH,
            intreq: true
        },
        {
            id: 'imghgt',
            label: 'Height (pixels)',
            min: 10, max: 768,
            value: ACTUAL_HEIGHT,
            intreq: true
        },
        { 
            id: 'virtpix',
            label: 'Virtual pixel size',
            min: 1, max: 300,
            value: PIXEL_SIZE,
            intreq: true
        },
        {
            id: 'aalias',
            label: 'Anti-alias factor',
            min: 1, max: 5,
            value: ANTI_ALIAS,
            intreq: true
        },
        {
            id: 'framecount',
            label: 'Frame count',
            min: 5, max: 1000,
            value: FRAME_COUNT,
            intreq: true
        },
        {
            id: 'framedur',
            label: 'Frame duration (seconds)',
            min: 0.01, max: 10,
            value: FRAME_INTERVAL
        }
    ]
    settingsInputBox = new SettingsInputBox(
        SETTINGS_ID,inputList,true
    )
    settingsDiv.appendChild(settingsInputBox.getTable())
    settingsDiv.addEventListener("change",(event)=>{
        if (event.target.id && event.target.id.startsWith(SETTINGS_ID)) {
            const shortID = event.target.id.slice(SETTINGS_ID.length)
            const value = settingsInputBox.get(shortID)
            switch (shortID) {
                case 'imgwid' : ACTUAL_WIDTH = value; break;
                case 'imghgt' : ACTUAL_HEIGHT = value; break;
                case 'virtpix' : PIXEL_SIZE = value; break;
                case 'aalias' : ANTI_ALIAS = value; break;
                case 'framecount': FRAME_COUNT = value; break;
                case 'framedur' : FRAME_INTERVAL = value; break;
                default:
                    console.error('unexpected ID ignoroed ', shortId)
            }
        }
    })
}

