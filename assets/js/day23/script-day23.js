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
const SETTINGS_ID = 'settings'

const SETTINGS_PREFIX = 'settx'  // TODO

let ACTUAL_WIDTH = 600
let ACTUAL_HEIGHT = 450
let PIXEL_SIZE = 10
let ANTI_ALIAS = 2

let FRAME_COUNT = 200
let FRAME_INTERVAL = 0.15

let goAgainButton = null
let settingsDiv = null
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
        settingsDiv = linkElement(SETTINGS_ID)
        createSettingsInputs()
        enableButton(true)  // TODO ?
        // makeAnimationIfEnabled()  // TODO - reenable after testing
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

function createSettingsInputs() {
    const REQ_INT_LIT = 'requireint'
    if (!settingsDiv) {
        throw 'settings div has not been created'
    }
    const tbl = document.createElement("table")
    const tbody = document.createElement("tbody")
    //
    addInputRow('Width (pixels)','imgwid',10,1024,ACTUAL_WIDTH)
    addInputRow('Height (pixels)','imghgt',10,768,ACTUAL_HEIGHT)
    addInputRow('Virtual pixel size','virtpix',1,300,PIXEL_SIZE)
    addInputRow('Anti-alias factor','aalias',1,5,ANTI_ALIAS)
    addInputRow('Frame count','framecount',5,1000,FRAME_COUNT)
    addInputRow('Frame duration (seconds)','framedur',0.01,10,FRAME_INTERVAL)
    //
    tbl.appendChild(tbody)
    settingsDiv.appendChild(tbl)
    function addInputRow(lbl,id,lo,hi,val) {
        const tr = document.createElement("tr")
        const td1 = document.createElement("td")
        td1.textContent = lbl
        tr.appendChild(td1)
        const td2 = document.createElement("td")
        td2.textContent = "range: " + lo + " to " + hi
        tr.appendChild(td2)
        const td3 = document.createElement("td")
        const inp = document.createElement("input")
        inp.value = val
        inp.setAttribute("id",SETTINGS_PREFIX+id)
        inp.setAttribute("type","number")
        inp.setAttribute("min",lo)
        inp.setAttribute("max",hi)
        const isInt = Number.isInteger(lo) && Number.isInteger(hi)
        inp.setAttribute(REQ_INT_LIT,(isInt))
        inp.style.textAlign = "right"
        inp.style.width = '8em'
        td3.appendChild(inp)
        tr.appendChild(td3)
        tbody.appendChild(tr)
    }
    tbody.addEventListener('change',(event)=>{
        console.log('changes not enabled yet for TODO table body ', event)
        const targ = event.target
        if (targ.id && targ.id.startsWith(SETTINGS_PREFIX)) {
            const sansPrefixId = targ.id.slice(SETTINGS_PREFIX.length)
            console.log('modified id = ', sansPrefixId)
            const mustBeInt = (targ.getAttribute(REQ_INT_LIT) == 'true')
            console.log('require int = ', mustBeInt)
            console.log('value = ', targ.value, ' type = ', typeof targ.value)
            let value = 0
            if (mustBeInt) {
                try {
                    value = Math.round(parseInt(targ.value))
                } catch (err) {
                    console.error(err)
                    value = parseInt(targ.getAttribute("min"))
                }
            } else {
                try {
                    value = parseFloat(targ.value)
                } catch (err) {
                    console.error(err)
                    value = parseInt(targ.getAttribute("min"))
                }
            }
            targ.value = value
            console.log('value = ', value, ' type = ', typeof value)
            switch (sansPrefixId) {
                case 'imgwid':
                    ACTUAL_WIDTH = value
                    break;
                case 'imghgt':
                    ACTUAL_HEIGHT = value
                    break;
                case 'virtpix':
                    PIXEL_SIZE = value
                    break;
                case 'aalias':
                    ANTI_ALIAS = value
                    break;
                case 'framecount':
                    FRAME_COUNT = value
                    break;
                case 'framedur':
                    FRAME_INTERVAL = value
                    break;
                default:
                    console.error ('unexpected id ignored: ', sansPrefixId)
            }
        } else {
            console.error('trapped targ does not start with ' + SETTINGS_PREFIX + ':', targ)
        }

    })
}