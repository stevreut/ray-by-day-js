import GraphicStatusReportBar from "../utils/graph-status-bar.js"
import { setImageDimensions } from "../utils/dom-utils.js"
import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import BiVariantGrapher from "../day20/bivargrapher.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import ReflectiveSphere from "../day20/reflective-sphere.js"
import RefractiveSphere from "../day22/refractive-sphere.js"
import SunnySky from "../day25/sunny-sky.js"
import NightSky from "../day25/night-sky.js"
import CanvasGridGrapher from "../day16/canvas-grid-grapher.js"
import ImagePlane from "./image-plane.js"
import { saveRayTraceImage, DAY_TYPES } from "../utils/image-saver.js"

const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'
const HI_QUALITY_BUTTON_ID = 'highqbtn'
const LO_QUALITY_BUTTON_ID = 'lowqbtn'
const SAVE_IMAGE_BUTTON_ID = 'savebtn'
const MODE_SELECT_ID = 'daymodeselect'
const IMG_FILE_ID = 'imgfile'

const MIRROR_BALL_COLOR = new Color(0.8, 0.8, 0.8);
const CLEAR_BALL_COLOR = new Color(0.1, 0.16, 0.12);

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
let imgFileInput = null

onload = async () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        highQualityButton = linkElement(HI_QUALITY_BUTTON_ID)
        lowQualityButton = linkElement(LO_QUALITY_BUTTON_ID)
        dayModeSelect = linkElement(MODE_SELECT_ID)
        saveImageButton = linkElement(SAVE_IMAGE_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        statusBar = new GraphicStatusReportBar(STATUS_BAR_ID)
        imgFileInput = linkElement(IMG_FILE_ID)
        const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
        targetImageWidth = dimensions.targetWidth
        targetImageHeight = dimensions.targetHeight
        pixelSize = dimensions.pixelSize
        antiAlias = dimensions.antiAlias
        insertBlankCanvas()
        handleDayNightModeChange()
        
        // TEMPORARY CODE START - Load phillyjs.png image and create ImagePlane
        const phillyjsImage = await loadPhillyJSImage()
        // TEMPORARY CODE END
        
        initEnvironment(phillyjsImage)
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
            initEnvironment(phillyjsImage)
            await processImage(imgParagraph, durationElem)
            enableButton(highQualityButton, true)
            enableButton(lowQualityButton, false)
        })
        imgFileInput.addEventListener('change', () => {
            goAgainButton.click();
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
            await saveRayTraceImage('renderedcanvas', DAY_TYPES.IMAGE_PLANE, () => {
                enableButton(saveImageButton, false)
            })
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
    imgFileInput.disabled = true
    
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
    imgFileInput.disabled = false
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

function initEnvironment(image = null) {
    optEnv = new OpticalEnvironment()
    const cameraOrigin = randomCameraPosition()
    const cameraDirection = cameraOrigin.scalarMult(-1)
    const cameraOriginDistance = Math.max(cameraOrigin.magn(), 3)
    const cameraRay = new Ray(
        cameraOrigin,
        cameraDirection
    )
    optEnv.setCamera(cameraRay, 0.1, cameraOriginDistance)
    
    // Add image plane or checkered plane at y = -1
    if (image) {
        optEnv.addOpticalObject(new ImagePlane(-1, image, 5, true, new Color(0.2, 0.2, 0.2))) // 5 units wide per tile, no tiling, dark gray default
    } else {
        optEnv.addOpticalObject(new Plane(-1, 1, 0.5))
    }
    
    const reflectiveSphere = new ReflectiveSphere(
        new Vector3D(-0.5, 0.8, 0), 
        1, 
        MIRROR_BALL_COLOR
    )
    optEnv.addOpticalObject(reflectiveSphere)
    
    const refractiveSphere = new RefractiveSphere(
        new Vector3D(0.8, 0.2, -0.5),
        0.5,
        CLEAR_BALL_COLOR,
        1.5
    )
    optEnv.addOpticalObject(refractiveSphere)

    // Add sky based on day/night mode
    if (isNightMode()) {
        optEnv.addOpticalObject(new NightSky())
    } else {
        const sunVector = randomSunDirection()
        optEnv.addOpticalObject(new SunnySky(sunVector))
    }
}

function randomCameraPosition() {
    const LO_DIST = 3
    const HI_DIST = 8
    const LO_LAT = 3
    const HI_LAT = 40
    const LO_LON = 150
    const HI_LON = 210
    const longitude = (Math.random()*(HI_LON-LO_LON)+LO_LON)*Math.PI/180
    let latitude = Math.random()**2 // **2 skews towards lower values
    latitude = latitude*(HI_LAT-LO_LAT)+LO_LAT  // camera elevation angle - between LO_LAT and HI_LAT degrees
    latitude *= Math.PI/180 // converted to radians
    const distance = Math.random()*(HI_DIST-LO_DIST)+LO_DIST  // camera distance - between LO_DIST and HI_DIST
    const z = Math.sin(latitude)*distance 
    const cosDist = Math.cos(latitude)*distance
    const x = Math.sin(longitude)*cosDist
    const y = Math.cos(longitude)*cosDist
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

// TEMPORARY CODE START - Load phillyjs.png image
async function loadPhillyJSImage() {
    try {
        // Create HTMLImageElement
        const img = new Image()
        
        // Set up promise to wait for image to load
        const imageLoaded = new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
        })
        
        // Set the source to load the image
        img.src = '../assets/images/phillyjs.png'
        
        // Wait for image to load
        await imageLoaded
        
        console.log('PhillyJS image loaded successfully')
        return img
    } catch (error) {
        console.error('Error loading phillyjs.png:', error)
        return null
    }
}
// TEMPORARY CODE END 