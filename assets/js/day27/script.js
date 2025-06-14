import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import CanvasGridder from "../day20/canvas-gridder.js"
import BiVariantGrapher from "../day22/bivargrapher.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import ReflectiveSphere from "../day20/reflective-sphere.js"
import SunnySky from "../day25/sunny-sky.js"

import SierpinskiTetrahedron from "./sierp-tetra.js"


const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const STATS_PARAGRAPH_ID = 'statsp'
const REPEAT_BUTTON_ID = 'rptbtn'
const HI_QUALITY_BUTTON_ID = 'highqbtn'
const LO_QUALITY_BUTTON_ID = 'lowqbtn'
const SAVE_IMAGE_BUTTON_ID = 'savebtn'
const IMG_CANVAS_ID = 'renderedcanvas'
const SELECT_RECURSION_ID = 'recurssel'
const SELECT_MODE_ID = 'decoratesel'
const SPHERE_COLOR_PICKER_ID = 'sphcolorinput'
const SPHERE_COLOR_HEX_TXT = 'sphcolorhex'

const DEFAULT_RECURSION = 3

const TETRAHEDRON_HEX_COLOR = "#ded4ce"
const BACKDROP_HEX_COLOR = "#998877"
const PLANE_LIGHT_SQR_COLOR = "#666a6f"

const DEFAULT_IMAGE_WIDTH = 1024
const ASPECT_RATIO = 1
let targetImageWidth = null
let targetImageHeight = null
let pixelSize = null
let antiAlias = null

let sunVector = null

let statBarElem = null
let selectRecursionElem = null
let selectModeElem = null
let sphereColorPickerElem = null
let sphereColorHexElem = null
let goAgainButton = null
let highQualityButton = null
let lowQualityButton = null
let saveImageButton = null
let imgParagraph = null
let durationElem = null
let statisticsParagraphElem = null

onload = async () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        selectRecursionElem = linkElement(SELECT_RECURSION_ID)
        selectModeElem = linkElement(SELECT_MODE_ID)
        sphereColorPickerElem = linkElement(SPHERE_COLOR_PICKER_ID)
        sphereColorHexElem = linkElement(SPHERE_COLOR_HEX_TXT)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        highQualityButton = linkElement(HI_QUALITY_BUTTON_ID)
        lowQualityButton = linkElement(LO_QUALITY_BUTTON_ID)
        saveImageButton = linkElement(SAVE_IMAGE_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        statisticsParagraphElem = linkElement(STATS_PARAGRAPH_ID)
        statBarElem = linkElement(STATUS_BAR_ID)
        setImageDimensions(false)
        insertBlankCanvas()
        initEnvironment()
        await processImage(imgParagraph,durationElem)
        enableButton(lowQualityButton,false)
        goAgainButton.addEventListener('click',async ()=>{
            setImageDimensions(false)
            initEnvironment()
            await processImage(imgParagraph,durationElem)
            enableButton(highQualityButton,true)
            enableButton(lowQualityButton,false)
        })
        highQualityButton.addEventListener('click',async ()=>{
            setImageDimensions(true)
            await processImage(imgParagraph,durationElem)
            enableButton(highQualityButton,false)
            enableButton(lowQualityButton,true)
        })
        lowQualityButton.addEventListener('click',async ()=>{
            setImageDimensions(false)
            await processImage(imgParagraph,durationElem)
            enableButton(highQualityButton,true)
            enableButton(lowQualityButton,false)
        })
        saveImageButton.addEventListener('click',async ()=>{
            enableButton(goAgainButton,false)
            const hiIsEnabled = !highQualityButton.disabled
            const loIsEnabled = !lowQualityButton.disabled
            enableButton(highQualityButton,false)
            enableButton(lowQualityButton,false)
            await saveImageAsDownload()
            enableButton(goAgainButton,true)
            enableButton(highQualityButton,hiIsEnabled)
            enableButton(lowQualityButton,loIsEnabled)
        })
        selectModeElem.addEventListener('change',()=>{
            const selectedMode = selectModeElem.value
            const makeVisible = (selectedMode && (selectedMode !== 'none'))
            sphereColorPickerElem.disabled = !makeVisible
            sphereColorPickerElem.parentElement.style.visibility = (makeVisible?"visible":"hidden")
        })
        sphereColorPickerElem.addEventListener('change',() => {
            const color = sphereColorPickerElem.value
            sphereColorHexElem.value = color
            sphereColorHexElem.style.color = color.toUpperCase()
            const isPale = (parseInt(color.slice(3,5),16) > 128)
            sphereColorHexElem.style.backgroundColor = (isPale?"#444":"#fff")
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
    targetImageHeight = Math.round(targetImageWidth/ASPECT_RATIO)
    pixelSize = (isHiQuality?1:(targetImageWidth<=512?1:3))
    antiAlias = 3
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
                const fname = 'ray-trace-fractal-' +
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
    const cameraOriginDistance = Math.max(cameraOrigin.magn(),3)
    const cameraRay = new Ray(
        cameraOrigin,
        cameraDirection
    )
    optEnv.setCamera(cameraRay,0.1,cameraOriginDistance)
    const recursionLevel = getRecursionLevelSelection()
    updateRecursionStats(recursionLevel)
    const modeString = selectModeElem.value
    const sphereColor = Color.colorFromHex(sphereColorPickerElem.value)
    console.log('the value of color is ', sphereColor, ' type = ', typeof sphereColor, ' at ', new Date())
    optEnv.addOpticalObject(new SierpinskiTetrahedron(new Vector3D(),2,recursionLevel,
        Color.colorFromHex(TETRAHEDRON_HEX_COLOR),
        modeString,sphereColor))
    const mirroringSphereDistance = 4
    const mirroringSphereRadius = 50
    const mirroringSphereOffset = mirroringSphereRadius+mirroringSphereDistance
    const sphereCenter = new Vector3D(0,-mirroringSphereOffset,0)
    optEnv.addOpticalObject(new ReflectiveSphere(sphereCenter,mirroringSphereRadius,Color.colorFromHex(BACKDROP_HEX_COLOR)))
    optEnv.addOpticalObject(new Plane(-10,10,6,Color.colorFromHex(PLANE_LIGHT_SQR_COLOR)))
    sunVector = randomSunDirection()
    optEnv.addOpticalObject(new SunnySky(sunVector))
}

function randomSunDirection() {
    while (true) {
        const x = Math.random()*2-1
        const y = Math.random()*2-1
        const z = Math.random()*2-1
        if (z >= 0 &&
            y > 0.6 &&
            x*x + y*y + z*z <= 1 &&
            (x != 0 || y != 0 || z != 0)) {
                return new Vector3D(x,y,z)
        }
    }
}

function randomCameraPosition() {
    const LO_DIST = 8
    const HI_DIST = 8
    const LO_LAT = -10
    const HI_LAT = 20
    const LO_LON = 75
    const HI_LON = 105
    let longitude = Math.random()*(HI_LON-LO_LON)+LO_LON
    longitude *= Math.PI/180
    let latitude = Math.random()**2 // **2 skews towards lower values
    latitude = latitude*(HI_LAT-LO_LAT)+LO_LAT  // camera elevation angle - between LO_LAT and HI_LAT degrees
    latitude *= Math.PI/180 // converted to radians
    let distance = Math.sqrt(Math.random())  // sqrt skews towards higher values, still between 0 and 1
    distance = distance*(HI_DIST-LO_DIST)+LO_DIST  // camera distance - between LO_DIST and HI_DIST
    const z = Math.sin(latitude)*distance 
    const cosDist = Math.cos(latitude)*distance
    const x = Math.cos(longitude)*cosDist
    const y = Math.sin(longitude)*cosDist
    const vec = new Vector3D(x,y,z)
    return vec
}

function getRecursionLevelSelection() {
    if (!selectRecursionElem) {
        return DEFAULT_RECURSION
    }
    const strVal = selectRecursionElem.value
    try {
        const val = parseInt(strVal)
        return Math.round(Math.max(0,Math.min(9,val)))
    } catch (err) {
        console.error('parse error from recursion selection', err)
        return DEFAULT_RECURSION
    }
}

function updateRecursionStats(level) {
    const tetraCount = 4**level
    const triangleCount = tetraCount*4
    const statsString = 'tetahedrons rendered: ' + tetraCount + ', ' +
        'triangles rendered: ' + triangleCount
    statisticsParagraphElem.textContent = statsString
}