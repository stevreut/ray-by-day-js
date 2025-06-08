import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import CanvasGridder from "../day20/canvas-gridder.js"
import BiVariantGrapher from "../day22/bivargrapher.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import RefractiveSphere from "../day22/refractive-sphere.js"

import ReflectiveIcosahedron from "./refl-icos.js"

import SunnySky from "./sunny-sky.js"
import NightSky from "./night-sky.js"

import ReflectiveCube from "./refl-cube.js"
import ReflectiveTetrahedron from "./refl-tetra.js"
import ReflectiveDodecahedron from "./refl-dodeca.js"
import ReflectiveOctahedron from "./refl-octa.js"


const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'
const HI_QUALITY_BUTTON_ID = 'highqbtn'
const LO_QUALITY_BUTTON_ID = 'lowqbtn'
const SAVE_IMAGE_BUTTON_ID = 'savebtn'
const MODE_SELECT_ID = 'daymodeselect'
const IMG_CANVAS_ID = 'renderedcanvas'

// Platonic solids colors in HTML hex values
const TETRA_HEX_COLOR = "#808c80"
const CUBE_HEX_COLOR = "#cc8080"
const OCTA_HEX_COLOR = "#ac6f8c"
const ICOSA_HEX_COLOR = "#"  // TBD
const DODECA_HEX_COLOR = "#a6b3cc"

const STATUS_CONTAINER_CLASS = 'progress-container'

const DEFAULT_IMAGE_WIDTH = 1024
let targetImageWidth = null
let targetImageHeight = null
let pixelSize = null
let antiAlias = null

let sunVector = null

let statBarElem = null
let goAgainButton = null
let highQualityButton = null
let lowQualityButton = null
let dayModeSelect = null
let saveImageButton = null
let imgParagraph = null
let durationElem = null


onload = async () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        highQualityButton = linkElement(HI_QUALITY_BUTTON_ID)
        lowQualityButton = linkElement(LO_QUALITY_BUTTON_ID)
        dayModeSelect = linkElement(MODE_SELECT_ID)
        saveImageButton = linkElement(SAVE_IMAGE_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        statBarElem = linkElement(STATUS_BAR_ID)
        setImageDimensions(false)
        insertBlankCanvas()
        handleDayNightModeChange()
        initEnvironment()
        await processImage(imgParagraph,durationElem)
        dayModeSelect.addEventListener('change',()=>{
            handleDayNightModeChange()
        })
        goAgainButton.addEventListener('click',async ()=>{
            setImageDimensions(false)
            initEnvironment()
            await processImage(imgParagraph,durationElem)
        })
        highQualityButton.addEventListener('click',async ()=>{
            setImageDimensions(true)
            await processImage(imgParagraph,durationElem)
            enableButton(highQualityButton,true)
            enableButton(lowQualityButton,true)
        })
        lowQualityButton.addEventListener('click',async ()=>{
            setImageDimensions(false)
            await processImage(imgParagraph,durationElem)
            enableButton(highQualityButton,true)
            enableButton(lowQualityButton,true)
        })
        saveImageButton.addEventListener('click',async ()=>{
            enableButton(goAgainButton,false)
            enableButton(highQualityButton,false)
            enableButton(lowQualityButton,false)
            await saveImageAsDownload()
            enableButton(goAgainButton,true)
            enableButton(highQualityButton,true)
            enableButton(lowQualityButton,true)
        })
    } catch (err) {
        console.error('err = ', err)
        alert ('error = ' + err.toString())
    }
}

function linkElement(id) {
    let elem = document.getElementById(id)
    if (!elem) {
        throw 'no ' + id + ' id found on page'
    }
    return elem
}

function enableButton(button,doEnable) {
    if (doEnable === null || doEnable === true) {
        button.disabled = false
        button.classList.remove('btndisabled')
    } else {
        button.disabled = true
        button.classList.add('btndisabled')
    }
}

function setImageDimensions(isHiQuality) {
    const containerWidth = imgParagraph.clientWidth
    if (isHiQuality) {
        targetImageWidth = DEFAULT_IMAGE_WIDTH
    } else {
        if (containerWidth && Number.isInteger(containerWidth) && containerWidth > 10
            && containerWidth <= 600) {
                targetImageWidth = containerWidth
        } else {
                targetImageWidth = DEFAULT_IMAGE_WIDTH
        }
    }
    targetImageHeight = Math.round(targetImageWidth*0.75)
    pixelSize = (isHiQuality?1:(targetImageWidth<=512?1:3))
    antiAlias = (isHiQuality?5:3)
}

async function processImage(imgParagraph,durationElem) {
    durationElem.textContent = ''
    enableButton(goAgainButton,false)
    enableButton(highQualityButton,false)
    enableButton(lowQualityButton,false)
    enableButton(saveImageButton,false)
    const gridder = new CanvasGridder()
    const startTime = new Date()
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(targetImageWidth/pixelSize),
        Math.floor(targetImageHeight/pixelSize),
        pixelSize, 
        targetImageHeight/pixelSize*0.33,
        (x,y) => {
            if (!optEnv) {
                throw 'optEnv not initiated'
            }
            return optEnv.colorFromXY(x,y)
        },
        antiAlias,
        statusReporterFunction
    )
    let canvasElem = await grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.innerHTML = ''
    imgParagraph.appendChild(canvasElem)
    canvasElem.id = IMG_CANVAS_ID
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
    enableButton(goAgainButton,true)
    enableButton(highQualityButton,true)
    enableButton(lowQualityButton,true)
    enableButton(saveImageButton,true)
}

function insertBlankCanvas() {
    const canv = document.createElement('canvas')
    if (canv) {
        imgParagraph.innerHTML = ''
        canv.width = targetImageWidth
        canv.height = targetImageHeight
        const localContext = canv.getContext('2d')
        if (localContext) {
            localContext.fillStyle = '#ddd';
            localContext.fillRect(0,0,targetImageWidth,targetImageHeight)
            localContext.fillStyle = '#bbb';
            const currentFont = localContext.font
            const fontParts = currentFont.split(' ')
            const newFont = '36px ' + fontParts.slice(1).join(' ')
            localContext.font = newFont
            localContext.fillText('Image creation in progress...',30,80)
        }
        imgParagraph.appendChild(canv)
    }
}

function handleDayNightModeChange() {
    let isNight = isNightMode()
    dayModeSelect.style.backgroundColor = (isNight?"#151547":"#ffffdd")
    dayModeSelect.style.color = (isNight?"#bcc8f8":"inherit")
    if (optEnv) {
        if (isNight) {
            optEnv.removeOpticalObjectsByClassName('SunnySky')
            optEnv.addOpticalObject(new NightSky())
        } else {
            optEnv.removeOpticalObjectsByClassName('NightSky')
            optEnv.addOpticalObject(new SunnySky(randomSunDirection()))
        }
    }
}

function isNightMode() {
    return (dayModeSelect.value === 'night')
}

function statusReporterFunction(frac) {
    if (typeof frac !== 'number') {
        console.error('status is non-number')
    } else {
        let p = Math.round(Math.max(0,Math.min(1,frac))*1000)/10
        p = p.toFixed(1)
        statBarElem.textContent = 'Status: ' + p + '% complete'
        statBarElem.style.width = (p + '%')
    }
}

async function saveImageAsDownload() {
    const canv = document.getElementById(IMG_CANVAS_ID)
    if (canv) {
        const url = canv.toDataURL('image/png')
        if (url && typeof url === 'string') {
            const link = document.createElement("a")
            if (link) {
                link.href = url
                const fname = 'ray-trace-with-object-grouping-' +
                    (new Date()).getTime() + '.png'
                link.download = fname
                link.click()
                enableButton(saveImageButton,false)
            }
        }
    }
}

let optEnv = null

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    const cameraOrigin = new randomCameraPosition()
    const cameraDirection = cameraOrigin.scalarMult(-1)
    const cameraOriginDistance = cameraOrigin.magn()
    const cameraRay = new Ray(
        cameraOrigin,
        cameraDirection
    )
    optEnv.setCamera(cameraRay,0.25,cameraOriginDistance)
    initRandomShapes()
    optEnv.addOpticalObject(new Plane(-7.5,5,2.5/*,new Color(0.6,0.6,0.6),new Color(0.2,0.1,0.2)*/))
    if (isNightMode()) {
        optEnv.addOpticalObject(new NightSky())
    } else {
        sunVector = randomSunDirection()
        optEnv.addOpticalObject(new SunnySky(sunVector))
    }
}

function initRandomShapes() {
    const TARGET_SHAPE_COUNT = 25
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.2
    const SHAPE_NAMES = 'icos;spht;spht;cube;tetr;dode;octa'.split(';')
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter()
        }
        let rando = Math.floor(Math.random()*SHAPE_NAMES.length)
        candidateObject.type = SHAPE_NAMES[rando]
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
        if (hasIntersect) {
            rejectCount++
        } else {
            shapeTempArray.push(candidateObject)
        }
    }
    shapeTempArray.forEach(shape=>{
        const { type } = shape
        let obj = null
        switch (type) {
            case 'icos':
                obj = new ReflectiveIcosahedron(shape.center,shape.radius,randomColor(0.5,0.6))
                break;
            case 'spht':
                obj = new RefractiveSphere(shape.center,shape.radius,randomColor(),1.5)
                break;
            case 'cube':
                obj = new ReflectiveCube(shape.center,shape.radius,
                    Color.colorFromHex(CUBE_HEX_COLOR))
                break;
            case 'tetr':
                obj = new ReflectiveTetrahedron(shape.center,shape.radius,
                    Color.colorFromHex(TETRA_HEX_COLOR))
                break;
            case 'dode':
                obj = new ReflectiveDodecahedron(shape.center,shape.radius,
                    Color.colorFromHex(DODECA_HEX_COLOR))
                break;
            case 'octa':
                obj = new ReflectiveOctahedron(shape.center,shape.radius,
                    Color.colorFromHex(OCTA_HEX_COLOR))
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
    return new Color(arr)
}

function randomSunDirection() {
    while (true) {
        const x = Math.random()*2-1
        const y = Math.random()*2-1
        const z = Math.random()*2-1
        if (z >= 0 &&
            x*x + y*y + z*z <= 1 &&
            (x != 0 || y != 0 || z != 0)) {
                return new Vector3D(x,y,z)
        }
    }
}

function randomCameraPosition() {
    const LO_DIST = 5
    const HI_DIST = 15
    const LO_LAT = 3
    const HI_LAT = 40
    const longitude = (Math.random()-0.5)*2*Math.PI
    let latitude = Math.random()**2 // **2 skews towards lower values
    latitude = latitude*(HI_LAT-LO_LAT)+LO_LAT  // camera elevation angle - between LO_LAT and HI_LAT degrees
    latitude *= Math.PI/180 // converted to radians
    let distance = Math.sqrt(Math.random())  // sqrt skews towards higher values, still between 0 and 1
    distance *= (HI_DIST-LO_DIST)+LO_DIST  // camera distance - between LO_DIST and HI_DIST
    const z = Math.sin(latitude)*distance 
    const cosDist = Math.cos(latitude)*distance
    const x = Math.cos(longitude)*cosDist
    const y = Math.sin(longitude)*cosDist
    const vec = new Vector3D(x,y,z)
    return vec
}