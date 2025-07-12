import GraphicStatusReportBar from "../utils/graph-status-bar.js"
import { setImageDimensions } from "../utils/dom-utils.js"
import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import BiVariantGrapher from "../day20/bivargrapher.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import RefractiveSphere from "../day22/refractive-sphere.js"
import SunnySky from "../day25/sunny-sky.js"
import NightSky from "../day25/night-sky.js"
import CanvasGridGrapher from "../day16/canvas-grid-grapher.js"

const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'
const HI_QUALITY_BUTTON_ID = 'highqbtn'
const LO_QUALITY_BUTTON_ID = 'lowqbtn'
const SAVE_IMAGE_BUTTON_ID = 'savebtn'
const MODE_SELECT_ID = 'daymodeselect'

const DEFAULT_IMAGE_WIDTH = 1024
let targetImageWidth = null
let targetImageHeight = null
let pixelSize = null
let antiAlias = null

let goAgainButton = null
let highQualityButton = null
let lowQualityButton = null
let dayModeSelect = null
let saveImageButton = null
let imgParagraph = null
let durationElem = null
let statusBar = null

onload = async () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        highQualityButton = linkElement(HI_QUALITY_BUTTON_ID)
        lowQualityButton = linkElement(LO_QUALITY_BUTTON_ID)
        dayModeSelect = linkElement(MODE_SELECT_ID)
        saveImageButton = linkElement(SAVE_IMAGE_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        statusBar = new GraphicStatusReportBar(STATUS_BAR_ID);
        const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
        targetImageWidth = dimensions.targetWidth
        targetImageHeight = dimensions.targetHeight
        pixelSize = dimensions.pixelSize
        antiAlias = dimensions.antiAlias
        insertBlankCanvas()
        handleDayNightModeChange()
        initEnvironment()
        await processImage(imgParagraph, durationElem)
        enableButton(lowQualityButton, false)
        dayModeSelect.addEventListener('change', () => {
            handleDayNightModeChange()
        })
        goAgainButton.addEventListener('click', async () => {
            const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
            targetImageWidth = dimensions.targetWidth
            targetImageHeight = dimensions.targetHeight
            pixelSize = dimensions.pixelSize
            antiAlias = dimensions.antiAlias
            await processImage(imgParagraph, durationElem)
            enableButton(highQualityButton, true)
            enableButton(lowQualityButton, false)
        })
        highQualityButton.addEventListener('click', async () => {
            const dimensions = setImageDimensions(imgParagraph, true, DEFAULT_IMAGE_WIDTH)
            targetImageWidth = dimensions.targetWidth
            targetImageHeight = dimensions.targetHeight
            pixelSize = dimensions.pixelSize
            antiAlias = dimensions.antiAlias
            await processImage(imgParagraph, durationElem)
            enableButton(highQualityButton, false)
            enableButton(lowQualityButton, true)
        })
        lowQualityButton.addEventListener('click', async () => {
            const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
            targetImageWidth = dimensions.targetWidth
            targetImageHeight = dimensions.targetHeight
            pixelSize = dimensions.pixelSize
            antiAlias = dimensions.antiAlias
            await processImage(imgParagraph, durationElem)
            enableButton(highQualityButton, true)
            enableButton(lowQualityButton, false)
        })
        saveImageButton.addEventListener('click', async () => {
            enableButton(goAgainButton, false)
            const hiIsEnabled = !highQualityButton.disabled
            const loIsEnabled = !lowQualityButton.disabled
            enableButton(highQualityButton, false)
            enableButton(lowQualityButton, false)
            // TODO: Implement save functionality for day30
            enableButton(saveImageButton, false)
            enableButton(goAgainButton, true)
            enableButton(highQualityButton, hiIsEnabled)
            enableButton(lowQualityButton, loIsEnabled)
        })
    } catch (err) {
        console.error('err = ', err)
        alert('error = ' + err.toString())
    }
}

function linkElement(id) {
    let elem = document.getElementById(id)
    if (!elem) {
        throw 'no ' + id + ' id found on page'
    }
    return elem
}

function enableButton(button, doEnable) {
    if (doEnable === null || doEnable === true) {
        button.disabled = false
        button.classList.remove('btndisabled')
    } else {
        button.disabled = true
        button.classList.add('btndisabled')
    }
}

async function processImage(imgParagraph, durationElem) {
    durationElem.textContent = ''
    enableButton(goAgainButton, false)
    enableButton(highQualityButton, false)
    enableButton(lowQualityButton, false)
    enableButton(saveImageButton, false)
    
    const startTime = new Date()
    
    const gridder = new CanvasGridGrapher()
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
    const durationMs = finTime.getTime() - startTime.getTime()
    const durationSecs = durationMs / 1000
    
    imgParagraph.innerHTML = ''
    imgParagraph.appendChild(canvasElem)
    canvasElem.id = 'renderedcanvas'
    
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
    enableButton(goAgainButton, true)
    enableButton(highQualityButton, true)
    enableButton(lowQualityButton, true)
    enableButton(saveImageButton, true)
}

function insertBlankCanvas() {
    const canv = document.createElement('canvas')
    if (canv) {
        imgParagraph.innerHTML = ''
        canv.width = targetImageWidth
        canv.height = targetImageHeight
        canv.style.maxWidth = '100%'
        canv.style.height = 'auto'
        const localContext = canv.getContext('2d')
        if (localContext) {
            localContext.fillStyle = '#ddd'
            localContext.fillRect(0, 0, targetImageWidth, targetImageHeight)
            localContext.fillStyle = '#bbb'
            const currentFont = localContext.font
            const fontParts = currentFont.split(' ')
            const newFont = '36px ' + fontParts.slice(1).join(' ')
            localContext.font = newFont
            localContext.fillText('Image File Data in Planes - Image creation in progress...', 30, 80)
        }
        imgParagraph.appendChild(canv)
    }
}

function handleDayNightModeChange() {
    let isNight = isNightMode()
    dayModeSelect.style.backgroundColor = (isNight ? "#151547" : "#ffffdd")
    dayModeSelect.style.color = (isNight ? "#bcc8f8" : "inherit")
    if (optEnv) {
        if (isNight) {
            optEnv.removeOpticalObjectsByClassName('SunnySky')
            optEnv.addOpticalObject(new NightSky())
        } else {
            optEnv.removeOpticalObjectsByClassName('NightSky')
            optEnv.addOpticalObject(new SunnySky(randomSunDirection()))
        }
        enableButton(lowQualityButton, true)
        enableButton(highQualityButton, true)
    }
}

function isNightMode() {
    return (dayModeSelect.value === 'night')
}

function statusReporterFunction(frac) {
    statusBar.setProgress(frac);
}

let optEnv = null

function initEnvironment() {
    optEnv = new OpticalEnvironment()
    const cameraOrigin = randomCameraPosition()
    const cameraDirection = cameraOrigin.scalarMult(-1)
    const cameraOriginDistance = Math.max(cameraOrigin.magn(), 3)
    const cameraRay = new Ray(
        cameraOrigin,
        cameraDirection
    )
    optEnv.setCamera(cameraRay, 0, cameraOriginDistance)
    
    // Add checkered plane at y = -1
    optEnv.addOpticalObject(new Plane(-1, 1, 0.5))
    
    // Add transparent sphere at (0,0,0) with radius 1 and color (0.9,0.9,0.9)
    const sphereColor = new Color(0.9, 0.9, 0.9)
    const transparentSphere = new RefractiveSphere(
        new Vector3D(0, 0, 0), 
        1, 
        sphereColor, 
        1.5  // refractive index of 1.5 (approximation of glass)
    )
    optEnv.addOpticalObject(transparentSphere)
    
    // Add sky based on day/night mode
    if (isNightMode()) {
        optEnv.addOpticalObject(new NightSky())
    } else {
        const sunVector = randomSunDirection()
        optEnv.addOpticalObject(new SunnySky(sunVector))
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