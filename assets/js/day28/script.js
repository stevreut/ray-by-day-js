import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import BiVariantGrapher from "../day20/bivargrapher.js"
import OpticalEnvironment from "../day22/optical-env.js"
import Plane from "../day22/plane.js"
import RefractiveSphere from "../day22/refractive-sphere.js"
import SunnySky from "../day25/sunny-sky.js"
import ReflectiveTetrahedron from "../day25/refl-tetra.js"
import ReflectiveCube from "../day25/refl-cube.js"
import ReflectiveOctahedron from "../day25/refl-octa.js"
import ReflectiveIcosahedron from "../day25/refl-icos.js"
import ReflectiveDodecahedron from "../day25/refl-dodeca.js"
import Compound12Sphere from "../day25/compound-12-sphere.js"
import SettingsInputBox from "../utils/settings-input-box.js"
import GraphicStatusReportBar from "../utils/graph-status-bar.js"
import { saveRayTraceImage, DAY_TYPES } from "../utils/image-saver.js"
import CanvasGridGrapher from "../day16/canvas-grid-grapher.js"
import { setImageDimensions } from "../utils/dom-utils.js"

const IMG_PARA_ID = 'imgpara'
const STATUS_BAR_ID = 'statbar'
const DURATION_TEXT_ID = 'dur'
const REPEAT_BUTTON_ID = 'rptbtn'
const HI_QUALITY_BUTTON_ID = 'highqbtn'
const LO_QUALITY_BUTTON_ID = 'lowqbtn'
const SAVE_IMAGE_BUTTON_ID = 'savebtn'
const IMG_CANVAS_ID = 'renderedcanvas'
const SETTINGS_ID = 'fr1inputs'

// Platonic solids colors in HTML hex values
const TETRA_HEX_COLOR = "#c299cc"
const CUBE_HEX_COLOR = "#cc9999"
const OCTA_HEX_COLOR = "#c2cc99"
const ICOSA_HEX_COLOR = "#99ccad"
const DODECA_HEX_COLOR = "#99adcc"
const GOLD_HEX_COLOR = "#ccb070"

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
let saveImageButton = null
let imgParagraph = null
let durationElem = null

let settingsInputBox1 = null
let settingsDiv = null
let statusBar = null

onload = async () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        highQualityButton = linkElement(HI_QUALITY_BUTTON_ID)
        lowQualityButton = linkElement(LO_QUALITY_BUTTON_ID)
        saveImageButton = linkElement(SAVE_IMAGE_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        statBarElem = linkElement(STATUS_BAR_ID)
        settingsDiv = linkElement(SETTINGS_ID)
        statusBar = new GraphicStatusReportBar(STATUS_BAR_ID);
        const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
        targetImageWidth = dimensions.targetWidth
        targetImageHeight = dimensions.targetHeight
        pixelSize = dimensions.pixelSize
        antiAlias = dimensions.antiAlias
        insertBlankCanvas()
        formatInputs()
        initEnvironment()
        await processImage(imgParagraph,durationElem)
        enableButton(lowQualityButton,false)
        goAgainButton.addEventListener('click',async ()=>{
            const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
            targetImageWidth = dimensions.targetWidth
            targetImageHeight = dimensions.targetHeight
            pixelSize = dimensions.pixelSize
            antiAlias = dimensions.antiAlias
            initEnvironment()
            await processImage(imgParagraph,durationElem)
            enableButton(highQualityButton,true)
            enableButton(lowQualityButton,false)
        })
        highQualityButton.addEventListener('click',async ()=>{
            const dimensions = setImageDimensions(imgParagraph, true, DEFAULT_IMAGE_WIDTH)
            targetImageWidth = dimensions.targetWidth
            targetImageHeight = dimensions.targetHeight
            pixelSize = dimensions.pixelSize
            antiAlias = dimensions.antiAlias
            await processImage(imgParagraph,durationElem)
            enableButton(highQualityButton,false)
            enableButton(lowQualityButton,true)
        })
        lowQualityButton.addEventListener('click',async ()=>{
            const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
            targetImageWidth = dimensions.targetWidth
            targetImageHeight = dimensions.targetHeight
            pixelSize = dimensions.pixelSize
            antiAlias = dimensions.antiAlias
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
            await saveRayTraceImage(IMG_CANVAS_ID, DAY_TYPES.LENSE, () => {
                enableButton(saveImageButton,false)
            })
            enableButton(goAgainButton,true)
            enableButton(highQualityButton,hiIsEnabled)
            enableButton(lowQualityButton,loIsEnabled)
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

async function processImage(imgParagraph,durationElem) {
    durationElem.textContent = ''
    enableButton(goAgainButton,false)
    enableButton(highQualityButton,false)
    enableButton(lowQualityButton,false)
    enableButton(saveImageButton,false)
    const gridder = new CanvasGridGrapher()
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
        canv.style.maxWidth = '100%'
        canv.style.height = 'auto'
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
    statusBar.setProgress(frac);
}

async function saveImageAsDownload() {
    await saveRayTraceImage(IMG_CANVAS_ID, DAY_TYPES.LENSE, () => {
        enableButton(saveImageButton,false)
    })
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
    const apertRadius = settingsInputBox1.get('apertdiam')/2
    const focalDistance = settingsInputBox1.get('focus')
    optEnv.setCamera(cameraRay,apertRadius,focalDistance)
    const bigLense = setBigLense(cameraRay)
    initRandomShapes(cameraRay.getOrigin(),bigLense)
    optEnv.addOpticalObject(new Plane(-7.5,5,2.5))
    sunVector = randomSunDirection()
    optEnv.addOpticalObject(new SunnySky(sunVector))
}

function setBigLense(cam) {
    const lenseRadius = settingsInputBox1.get('lenserad')
    const lenseCenterOffset = settingsInputBox1.get('lensedist')+lenseRadius
    const lenseCenter = cam.getOrigin().add(cam.getDirection().normalized().scalarMult(lenseCenterOffset))
    const lenseSphere = new RefractiveSphere(lenseCenter,lenseRadius,new Color(),settingsInputBox1.get('lenseidx'))
    optEnv.addOpticalObject(lenseSphere)
    return lenseSphere
}

function initRandomShapes(camOrigin,bigLense) {
    if (!(camOrigin instanceof Vector3D) || !(bigLense instanceof RefractiveSphere)) {
        throw 'unexpected parameter types'
    }
    const TARGET_SHAPE_COUNT = 8
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.2
    const SHAPE_NAMES = 'comp;comp;icos;icos;spht;spht;dode;cube'.split(';')
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter(camOrigin,bigLense)
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
        if (!hasIntersect && candidateObject.center.subt(bigLense.center).magn() <= candidateObject.radius+bigLense.radius+MIN_SPACE) {
            hasIntersect = true
        }
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
            case 'comp':
                obj = new Compound12Sphere(shape.center,shape.radius*0.45,shape.radius*0.55,
                    Color.colorFromHex(GOLD_HEX_COLOR))
                break;
            case 'icos':
                obj = new ReflectiveIcosahedron(shape.center,shape.radius,
                    Color.colorFromHex(ICOSA_HEX_COLOR))
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

function randomCenter(camOrigin,lense) {
    const camToLenseDir = lense.center.subt(camOrigin).normalized()
    const rangeCenter = lense.center.add(camToLenseDir.scalarMult(lense.radius+5))
    let arr = []
    for (let i=0;i<3;i++) {
        arr.push((Math.random()-0.5)*7)
    }
    let ctr = new Vector3D(arr)
    ctr = ctr.add(rangeCenter)
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

function formatInputs() {
    formatFrame1Inputs()
}

function formatFrame1Inputs() {
    settingsInputBox1 = new SettingsInputBox("fr1",[
        {
            id: 'focus',
            label: 'Focal Distance',
            min: 0.1,
            value: 30
        },
        {
            id: 'apertdiam',
            label: 'Aperture',
            min: 0, max: 5,
            value: 0.5
        },
        {
            id: 'lensedist',
            label: 'Distance to Lense',
            min: 1e-5, max: 5, value: 1
        },
        {
            id: 'lenserad',
            label: 'Spherical Lense Radius',
            min: 1.5, max: 20, value: 5
        },
        {   
            id: 'lenseidx',
            label: 'Lense Index of Refraction',
            min: 1.001, max: 25, value: 1.5
        }
    ],true)
    settingsDiv.appendChild(settingsInputBox1.getTable())
}
