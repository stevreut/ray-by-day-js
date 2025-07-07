import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import BiVariantGrapher from "../day20/bivargrapher.js"
import OpticalEnvironment from "../day22/optical-env.js"
import OpticalEnvironmentNew from "./optical-env.js"
import ConvexLens from "./convex-lens.js"
import ConcaveLens from "./concave-lens.js"
import DirectionalFilter from "./directional-filter.js"
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

// Second section constants
const SETTINGS_ID_2 = 'fr2inputs'
const IMG_PARA_ID_2 = 'imgpara2'
const STATUS_BAR_ID_2 = 'statbar2'
const DURATION_TEXT_ID_2 = 'dur2'
const REPEAT_BUTTON_ID_2 = 'rptbtn2'
const HI_QUALITY_BUTTON_ID_2 = 'highqbtn2'
const LO_QUALITY_BUTTON_ID_2 = 'lowqbtn2'
const SAVE_IMAGE_BUTTON_ID_2 = 'savebtn2'
const IMG_CANVAS_ID_2 = 'renderedcanvas2'

// Third section constants
const SETTINGS_ID_3 = 'fr3inputs'
const IMG_PARA_ID_3 = 'imgpara3'
const STATUS_BAR_ID_3 = 'statbar3'
const DURATION_TEXT_ID_3 = 'dur3'
const REPEAT_BUTTON_ID_3 = 'rptbtn3'
const HI_QUALITY_BUTTON_ID_3 = 'highqbtn3'
const LO_QUALITY_BUTTON_ID_3 = 'lowqbtn3'
const SAVE_IMAGE_BUTTON_ID_3 = 'savebtn3'
const IMG_CANVAS_ID_3 = 'renderedcanvas3'

// Platonic solids colors in HTML hex values
const TETRA_HEX_COLOR = "#c299cc"
const CUBE_HEX_COLOR = "#cc9999"
const OCTA_HEX_COLOR = "#c2cc99"
const ICOSA_HEX_COLOR = "#99ccad"
const DODECA_HEX_COLOR = "#99adcc"
const GOLD_HEX_COLOR = "#ccb070"

const LO_QUAL_PIXSIZE = 5

const DEFAULT_IMAGE_WIDTH = 1024
let targetImageWidth = null
let targetImageHeight = null
let pixelSize = null
let antiAlias = null

let sunVector = null

let goAgainButton = null
let highQualityButton = null
let lowQualityButton = null
let saveImageButton = null
let imgParagraph = null
let durationElem = null

let settingsInputBox1 = null
let settingsDiv = null
let statusBar = null

// Second section variables
let settingsInputBox2 = null
let settingsDiv2 = null
let goAgainButton2 = null
let highQualityButton2 = null
let lowQualityButton2 = null
let saveImageButton2 = null
let imgParagraph2 = null
let durationElem2 = null
let statusBar2 = null
let optEnv2 = null

// Third section variables
let settingsInputBox3 = null
let settingsDiv3 = null
let goAgainButton3 = null
let highQualityButton3 = null
let lowQualityButton3 = null
let saveImageButton3 = null
let imgParagraph3 = null
let durationElem3 = null
let statusBar3 = null
let optEnv3 = null

onload = async () => {
    try {
        imgParagraph = linkElement(IMG_PARA_ID)
        goAgainButton = linkElement(REPEAT_BUTTON_ID)
        highQualityButton = linkElement(HI_QUALITY_BUTTON_ID)
        lowQualityButton = linkElement(LO_QUALITY_BUTTON_ID)
        saveImageButton = linkElement(SAVE_IMAGE_BUTTON_ID)
        durationElem = linkElement(DURATION_TEXT_ID)
        settingsDiv = linkElement(SETTINGS_ID)
        statusBar = new GraphicStatusReportBar(STATUS_BAR_ID);
        const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
        dimensions.pixelSize = LO_QUAL_PIXSIZE
        targetImageWidth = dimensions.targetWidth
        targetImageHeight = dimensions.targetHeight
        pixelSize = dimensions.pixelSize
        antiAlias = dimensions.antiAlias
        insertBlankCanvas()
        formatInputs()
        initEnvironment()
        
        // Initialize second section
        initSecondSection()
        
        // Initialize third section
        await initThirdSection()
        
        // Start all three image generations in parallel
        const firstImage = processImage(imgParagraph, durationElem)
        const secondImage = processImage2(imgParagraph2, durationElem2, false)
        const thirdImage = processImage3(imgParagraph3, durationElem3, false)
        
        // Wait for all to complete
        await Promise.all([firstImage, secondImage, thirdImage])
        
        // Enable buttons after all complete
        enableButton(lowQualityButton, false)
        enableButton(lowQualityButton2, false)
        enableButton(lowQualityButton3, false)
        goAgainButton.addEventListener('click',async ()=>{
            const dimensions = setImageDimensions(imgParagraph, false, DEFAULT_IMAGE_WIDTH)
            dimensions.pixelSize = LO_QUAL_PIXSIZE
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
            dimensions.pixelSize = LO_QUAL_PIXSIZE
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

function formatInputs2() {
    formatFrame2Inputs()
}

function formatFrame2Inputs() {
    settingsInputBox2 = new SettingsInputBox("fr2",[
        {
            id: 'focus',
            label: 'Focal Distance',
            min: 0.1,
            value: 20
        },
        {
            id: 'apertdiam',
            label: 'Aperture',
            min: 0, max: 5,
            value: 0.3
        },
        {
            id: 'lensedist',
            label: 'Distance to Center of Lens',
            min: 1, max: 10, value: 5
        },
        {
            id: 'lenserad',
            label: 'Lens Radius',
            min: 1, max: 15, value: 2.5
        },
        {   
            id: 'lensethick',
            label: 'Lens Thickness',
            min: 0.01, max: 5, value: 0.5
        },
        {   
            id: 'lenseidx',
            label: 'Lens Index of Refraction',
            min: 1.001, max: 30, value: 1.5
        }
    ],true)
    settingsDiv2.appendChild(settingsInputBox2.getTable())
}

// Second section functions
async function initSecondSection() {
    try {
        imgParagraph2 = linkElement(IMG_PARA_ID_2)
        goAgainButton2 = linkElement(REPEAT_BUTTON_ID_2)
        highQualityButton2 = linkElement(HI_QUALITY_BUTTON_ID_2)
        lowQualityButton2 = linkElement(LO_QUALITY_BUTTON_ID_2)
        saveImageButton2 = linkElement(SAVE_IMAGE_BUTTON_ID_2)
        durationElem2 = linkElement(DURATION_TEXT_ID_2)
        settingsDiv2 = linkElement(SETTINGS_ID_2)
        statusBar2 = new GraphicStatusReportBar(STATUS_BAR_ID_2)
        
        // Initialize second settings input box
        formatInputs2()
        
        const hardcodedDimensions = setImageDimensions(imgParagraph2, false, DEFAULT_IMAGE_WIDTH)
        hardcodedDimensions.pixelSize = LO_QUAL_PIXSIZE
        insertBlankCanvas2()
        initEnvironment2()
        
        // Add event listeners for second section
        goAgainButton2.addEventListener('click', async () => {
            initEnvironment2()
            await processImage2(imgParagraph2, durationElem2, false)
            enableButton(highQualityButton2, true)
            enableButton(lowQualityButton2, false)
        })
        
        highQualityButton2.addEventListener('click', async () => {
            await processImage2(imgParagraph2, durationElem2, true)
            enableButton(highQualityButton2, false)
            enableButton(lowQualityButton2, true)
        })
        
        lowQualityButton2.addEventListener('click', async () => {
            await processImage2(imgParagraph2, durationElem2, false)
            enableButton(highQualityButton2, true)
            enableButton(lowQualityButton2, false)
        })
        
        saveImageButton2.addEventListener('click', async () => {
            enableButton(goAgainButton2, false)
            const hiIsEnabled = !highQualityButton2.disabled
            const loIsEnabled = !lowQualityButton2.disabled
            enableButton(highQualityButton2, false)
            enableButton(lowQualityButton2, false)
            await saveRayTraceImage(IMG_CANVAS_ID_2, DAY_TYPES.LENSE_ENHANCED, () => {
                enableButton(saveImageButton2, false)
            })
            enableButton(goAgainButton2, true)
            enableButton(highQualityButton2, hiIsEnabled)
            enableButton(lowQualityButton2, loIsEnabled)
        })
    } catch (err) {
        console.error('Second section error = ', err)
        alert('Second section error = ' + err.toString())
    }
}

async function processImage2(imgParagraph, durationElem, highQuality = false) {
    durationElem.textContent = ''
    enableButton(goAgainButton2, false)
    enableButton(highQualityButton2, false)
    enableButton(lowQualityButton2, false)
    enableButton(saveImageButton2, false)
    
    const gridder = new CanvasGridGrapher()
    const startTime = new Date()
    const dimensions = setImageDimensions(imgParagraph, highQuality, DEFAULT_IMAGE_WIDTH)
    if (!highQuality) {
        dimensions.pixelSize = LO_QUAL_PIXSIZE
    }
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(dimensions.targetWidth/dimensions.pixelSize),
        Math.floor(dimensions.targetHeight/dimensions.pixelSize),
        dimensions.pixelSize, 
        dimensions.targetHeight/dimensions.pixelSize*0.33,
        (x,y) => {
            if (!optEnv2) {
                throw 'optEnv2 not initiated'
            }
            return optEnv2.colorFromXY(x,y)
        },
        dimensions.antiAlias,
        statusReporterFunction2
    )
    
    let canvasElem = await grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.innerHTML = ''
    imgParagraph.appendChild(canvasElem)
    canvasElem.id = IMG_CANVAS_ID_2
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
    enableButton(goAgainButton2, true)
    enableButton(highQualityButton2, true)
    enableButton(lowQualityButton2, true)
    enableButton(saveImageButton2, true)
}

function insertBlankCanvas2() {
    const canv = document.createElement('canvas')
    if (canv) {
        imgParagraph2.innerHTML = ''
        canv.width = DEFAULT_IMAGE_WIDTH
        canv.height = DEFAULT_IMAGE_WIDTH * 0.75
        canv.style.maxWidth = '100%'
        canv.style.height = 'auto'
        const localContext = canv.getContext('2d')
        if (localContext) {
            localContext.fillStyle = '#ddd';
            localContext.fillRect(0,0,canv.width,canv.height)
            localContext.fillStyle = '#bbb';
            const currentFont = localContext.font
            const fontParts = currentFont.split(' ')
            const newFont = '36px ' + fontParts.slice(1).join(' ')
            localContext.font = newFont
            localContext.fillText('Enhanced Environment - Image creation in progress...',30,80)
        }
        imgParagraph2.appendChild(canv)
    }
}

function statusReporterFunction2(frac) {
    statusBar2.setProgress(frac);
}

function initEnvironment2() {
    optEnv2 = new OpticalEnvironmentNew()
    const cameraOrigin = new randomCameraPosition()
    const cameraDirection = cameraOrigin.scalarMult(-1)
    const cameraRay = new Ray(cameraOrigin, cameraDirection)
    
    // Get settings from the second input box
    const apertRadius = settingsInputBox2.get('apertdiam')/2
    const focalDistance = settingsInputBox2.get('focus')
    optEnv2.setCamera(cameraRay, apertRadius, focalDistance)
    
    // Add the convex lens using the new lens/filter functionality
    const lensDistance = settingsInputBox2.get('lensedist')
    const lensRadius = settingsInputBox2.get('lenserad')
    const lensThickness = settingsInputBox2.get('lensethick')
    const lensRefractiveIndex = settingsInputBox2.get('lenseidx')
    
    const convexLens = new ConvexLens(lensDistance, lensRadius, lensThickness, lensRefractiveIndex)
    optEnv2.addLenseOrFilter(convexLens)  // Use the new lens/filter method!
    
    // Add some objects behind the lens
    initRandomShapes2(cameraRay.getOrigin())
    optEnv2.addOpticalObject(new Plane(-15, 10, 5))
    sunVector = randomSunDirection()
    optEnv2.addOpticalObject(new SunnySky(sunVector))
}

// function setBigLense2(cam) {
//     const lenseRadius = 4
//     const lenseCenterOffset = 2 + lenseRadius
//     const lenseCenter = cam.getOrigin().add(cam.getDirection().normalized().scalarMult(lenseCenterOffset))
//     const lenseSphere = new RefractiveSphere(lenseCenter, lenseRadius, new Color(), 1.6)
//     optEnv2.addOpticalObject(lenseSphere)
//     return lenseSphere
// }

function initRandomShapes2(camOrigin) {
    if (!(camOrigin instanceof Vector3D)) {
        throw 'unexpected parameter types'
    }
    const TARGET_SHAPE_COUNT = 12  // Increased from 6 to 12
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.3  // Slightly increased spacing
    const SHAPE_NAMES = 'comp;comp;comp;spht;spht;spht;spht;icos;icos;cube;cube;dode;dode;octa;octa;tetr'.split(';')
    
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter2(camOrigin)
        }
        let rando = Math.floor(Math.random()*SHAPE_NAMES.length)
        candidateObject.type = SHAPE_NAMES[rando]
        candidateObject.radius = 0.8 + Math.random() * 0.4  // Random radius between 0.8 and 1.2
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
            // Safety check: if we've rejected too many attempts, reduce target count
            if (rejectCount > 1000) {
                console.warn(`Could only place ${shapeTempArray.length} objects after ${rejectCount} attempts. Stopping.`)
                break
            }
        } else {
            shapeTempArray.push(candidateObject)
        }
    }
    
    function randomCenter2(camOrigin) {
        // Camera points toward origin (0,0,0), so place objects in that direction
        // Get the direction from camera to origin (which is the camera's view direction)
        const cameraDirection = new Vector3D(0, 0, 0).subt(camOrigin).normalized()
        
        // Place objects at different distances along the camera's view direction
        const baseDistance = 15 + Math.random() * 10  // Random distance between 15-25
        const rangeCenter = camOrigin.add(cameraDirection.scalarMult(baseDistance))
        
        // Spread objects perpendicular to the camera direction
        // Create a coordinate system perpendicular to the camera direction
        const upVector = new Vector3D(0, 1, 0)
        const rightVector = cameraDirection.cross(upVector).normalized()
        const upPerpVector = rightVector.cross(cameraDirection).normalized()
        
        // Add random offsets perpendicular to the camera direction
        const rightOffset = (Math.random() - 0.5) * 8  // ±4 units
        const upOffset = (Math.random() - 0.5) * 8     // ±4 units
        
        const finalCenter = rangeCenter
            .add(rightVector.scalarMult(rightOffset))
            .add(upPerpVector.scalarMult(upOffset))
        
        return finalCenter
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
                obj = new RefractiveSphere(shape.center,shape.radius,randomColor(),1.3 + Math.random() * 0.4)
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
        }
        if (obj) {
            optEnv2.addOpticalObject(obj)
        }
    })
}

// Third section functions
async function initThirdSection() {
    try {
        imgParagraph3 = linkElement(IMG_PARA_ID_3)
        goAgainButton3 = linkElement(REPEAT_BUTTON_ID_3)
        highQualityButton3 = linkElement(HI_QUALITY_BUTTON_ID_3)
        lowQualityButton3 = linkElement(LO_QUALITY_BUTTON_ID_3)
        saveImageButton3 = linkElement(SAVE_IMAGE_BUTTON_ID_3)
        durationElem3 = linkElement(DURATION_TEXT_ID_3)
        settingsDiv3 = linkElement(SETTINGS_ID_3)
        statusBar3 = new GraphicStatusReportBar(STATUS_BAR_ID_3)
        
        // Initialize third settings input box
        formatInputs3()
        
        const hardcodedDimensions = setImageDimensions(imgParagraph3, false, DEFAULT_IMAGE_WIDTH)
        hardcodedDimensions.pixelSize = LO_QUAL_PIXSIZE
        insertBlankCanvas3()
        initEnvironment3()
        
        // Add event listeners for third section
        goAgainButton3.addEventListener('click', async () => {
            initEnvironment3()
            await processImage3(imgParagraph3, durationElem3, false)
            enableButton(highQualityButton3, true)
            enableButton(lowQualityButton3, false)
        })
        
        highQualityButton3.addEventListener('click', async () => {
            await processImage3(imgParagraph3, durationElem3, true)
            enableButton(highQualityButton3, false)
            enableButton(lowQualityButton3, true)
        })
        
        lowQualityButton3.addEventListener('click', async () => {
            await processImage3(imgParagraph3, durationElem3, false)
            enableButton(highQualityButton3, true)
            enableButton(lowQualityButton3, false)
        })
        
        saveImageButton3.addEventListener('click', async () => {
            enableButton(goAgainButton3, false)
            const hiIsEnabled = !highQualityButton3.disabled
            const loIsEnabled = !lowQualityButton3.disabled
            enableButton(highQualityButton3, false)
            enableButton(lowQualityButton3, false)
            await saveRayTraceImage(IMG_CANVAS_ID_3, DAY_TYPES.LENSE_ENHANCED, () => {
                enableButton(saveImageButton3, false)
            })
            enableButton(goAgainButton3, true)
            enableButton(highQualityButton3, hiIsEnabled)
            enableButton(lowQualityButton3, loIsEnabled)
        })
    } catch (err) {
        console.error('Third section error = ', err)
        alert('Third section error = ' + err.toString())
    }
}

async function processImage3(imgParagraph, durationElem, highQuality = false) {
    durationElem.textContent = ''
    enableButton(goAgainButton3, false)
    enableButton(highQualityButton3, false)
    enableButton(lowQualityButton3, false)
    enableButton(saveImageButton3, false)
    
    const gridder = new CanvasGridGrapher()
    const startTime = new Date()
    const dimensions = setImageDimensions(imgParagraph, highQuality, DEFAULT_IMAGE_WIDTH)
    if (!highQuality) {
        dimensions.pixelSize = LO_QUAL_PIXSIZE
    }
    
    const grapher = new BiVariantGrapher(
        gridder,
        Math.floor(dimensions.targetWidth/dimensions.pixelSize),
        Math.floor(dimensions.targetHeight/dimensions.pixelSize),
        dimensions.pixelSize, 
        dimensions.targetHeight/dimensions.pixelSize*0.33,
        (x,y) => {
            if (!optEnv3) {
                throw 'optEnv3 not initiated'
            }
            return optEnv3.colorFromXY(x,y)
        },
        dimensions.antiAlias,
        statusReporterFunction3
    )
    
    let canvasElem = await grapher.drawGraph()
    const finTime = new Date()
    const durationMs = finTime.getTime()-startTime.getTime()
    const durationSecs = durationMs/1000
    imgParagraph.innerHTML = ''
    imgParagraph.appendChild(canvasElem)
    canvasElem.id = IMG_CANVAS_ID_3
    durationElem.textContent = 'Image generation duration: ' + durationSecs + ' seconds'
    enableButton(goAgainButton3, true)
    enableButton(highQualityButton3, true)
    enableButton(lowQualityButton3, true)
    enableButton(saveImageButton3, true)
}

function insertBlankCanvas3() {
    const canv = document.createElement('canvas')
    if (canv) {
        imgParagraph3.innerHTML = ''
        canv.width = DEFAULT_IMAGE_WIDTH
        canv.height = DEFAULT_IMAGE_WIDTH * 0.75
        canv.style.maxWidth = '100%'
        canv.style.height = 'auto'
        const localContext = canv.getContext('2d')
        if (localContext) {
            localContext.fillStyle = '#ddd';
            localContext.fillRect(0,0,canv.width,canv.height)
            localContext.fillStyle = '#bbb';
            const currentFont = localContext.font
            const fontParts = currentFont.split(' ')
            const newFont = '36px ' + fontParts.slice(1).join(' ')
            localContext.font = newFont
            localContext.fillText('Concave Lens Environment - Image creation in progress...',30,80)
        }
        imgParagraph3.appendChild(canv)
    }
}

function statusReporterFunction3(frac) {
    statusBar3.setProgress(frac);
}

function initEnvironment3() {
    optEnv3 = new OpticalEnvironmentNew()
    const cameraOrigin = new randomCameraPosition()
    const cameraDirection = cameraOrigin.scalarMult(-1)
    const cameraRay = new Ray(cameraOrigin, cameraDirection)
    
    // Get settings from the third input box
    const apertRadius = settingsInputBox3.get('apertdiam')/2
    const focalDistance = settingsInputBox3.get('focus')
    optEnv3.setCamera(cameraRay, apertRadius, focalDistance)
    
    // Add the concave lens using the new lens/filter functionality
    const lensDistance = settingsInputBox3.get('lensedist')
    const lensRadius = settingsInputBox3.get('lenserad')
    const lensThickness = settingsInputBox3.get('lensethick')
    const sphereRadius = settingsInputBox3.get('sphererad')
    const lensRefractiveIndex = settingsInputBox3.get('lenseidx')
    
    const concaveLens = new ConcaveLens(lensDistance, lensRadius, lensThickness, sphereRadius, lensRefractiveIndex)
    optEnv3.addLenseOrFilter(concaveLens)  // Use the new lens/filter method!
    
    // Add a directional filter for aesthetic effect - creates color variation based on ray direction
    const aestheticFilter = new DirectionalFilter(Color.colorFromHex("#ff6600"), Color.colorFromHex("#0066ff"), 0.2)
    optEnv3.addLenseOrFilter(aestheticFilter)

    // Add some objects behind the lens
    initRandomShapes3(cameraRay.getOrigin())
    optEnv3.addOpticalObject(new Plane(-15, 10, 5))
    sunVector = randomSunDirection()
    optEnv3.addOpticalObject(new SunnySky(sunVector))
}

function initRandomShapes3(camOrigin) {
    if (!(camOrigin instanceof Vector3D)) {
        throw 'unexpected parameter types'
    }
    const TARGET_SHAPE_COUNT = 12
    let rejectCount = 0
    const shapeTempArray = []
    const MIN_SPACE = 0.3
    const SHAPE_NAMES = 'comp;comp;comp;spht;spht;spht;spht;icos;icos;cube;cube;dode;dode;octa;octa;tetr'.split(';')
    
    // First, place one object directly in line with the camera direction behind the lens
    const cameraDirection = new Vector3D(0, 0, 0).subt(camOrigin).normalized()
    const lensDistance = settingsInputBox3.get('lensedist')
    const baseDistance = lensDistance + 10 + Math.random() * 5  // Behind the lens
    const centerlineObject = {
        center: camOrigin.add(cameraDirection.scalarMult(baseDistance)),
        type: SHAPE_NAMES[Math.floor(Math.random()*SHAPE_NAMES.length)],
        radius: 0.8 + Math.random() * 0.4
    }
    shapeTempArray.push(centerlineObject)
    
    // Then place the remaining objects randomly
    while (shapeTempArray.length < TARGET_SHAPE_COUNT) {
        let candidateObject = {
            center: randomCenter3(camOrigin)
        }
        let rando = Math.floor(Math.random()*SHAPE_NAMES.length)
        candidateObject.type = SHAPE_NAMES[rando]
        candidateObject.radius = 0.8 + Math.random() * 0.4
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
            if (rejectCount > 1000) {
                console.warn(`Could only place ${shapeTempArray.length} objects after ${rejectCount} attempts. Stopping.`)
                break
            }
        } else {
            shapeTempArray.push(candidateObject)
        }
    }
    
    function randomCenter3(camOrigin) {
        const cameraDirection = new Vector3D(0, 0, 0).subt(camOrigin).normalized()
        const baseDistance = 15 + Math.random() * 10
        const rangeCenter = camOrigin.add(cameraDirection.scalarMult(baseDistance))
        
        const upVector = new Vector3D(0, 1, 0)
        const rightVector = cameraDirection.cross(upVector).normalized()
        const upPerpVector = rightVector.cross(cameraDirection).normalized()
        
        const rightOffset = (Math.random() - 0.5) * 8
        const upOffset = (Math.random() - 0.5) * 8
        
        const finalCenter = rangeCenter
            .add(rightVector.scalarMult(rightOffset))
            .add(upPerpVector.scalarMult(upOffset))
        
        return finalCenter
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
                obj = new RefractiveSphere(shape.center,shape.radius,randomColor(),1.3 + Math.random() * 0.4)
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
        }
        if (obj) {
            optEnv3.addOpticalObject(obj)
        }
    })
}

function formatInputs3() {
    formatFrame3Inputs()
}

function formatFrame3Inputs() {
    settingsInputBox3 = new SettingsInputBox("fr3",[
        {
            id: 'focus',
            label: 'Focal Distance',
            min: 0.1,
            value: 8
        },
        {
            id: 'apertdiam',
            label: 'Aperture',
            min: 0, max: 5,
            value: 0.2
        },
        {
            id: 'lensedist',
            label: 'Distance to Center of Lens',
            min: 1, max: 10, value: 8
        },
        {
            id: 'lenserad',
            label: 'Lens Radius',
            min: 0.5, max: 15, value: 3
        },
        {   
            id: 'lensethick',
            label: 'Lens Thickness',
            min: 0.01, max: 5, value: 0.1
        },
        {
            id: 'sphererad',
            label: 'Spherical Radius of Lense Surfaces',
            min: 4, max: 200, value: 10
        },
        {   
            id: 'lenseidx',
            label: 'Lens Index of Refraction',
            min: 1.1, max: 20, value: 1.5
        }
    ],true)
    settingsDiv3.appendChild(settingsInputBox3.getTable())
}
