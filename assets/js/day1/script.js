// import CodeExtractor from "../utils/code-extractor.js"
// import CodeFormatter from "../utils/code-formatter.js"
import CommonCodeUtility from "../utils/code-common.js"

onload = async function() {
    let commonUtilObj = new CommonCodeUtility()
    const makeSvgButton = document.getElementById('makesvgbtn')
    const textAreaElem = document.getElementById('svgtextarea')
    const clearButton = document.getElementById('clearbtn')
    let svgImgRef = document.getElementById('imgrefcode')
    let svgCodeElem = document.getElementById('svgcode')
    let makeSvgCodeElem = this.document.getElementById('makesvgcode')
    if (!(makeSvgButton && textAreaElem && clearButton && svgImgRef && 
        svgCodeElem && makeSvgCodeElem)) {
            throw 'missing expected id(s)'
    }
    makeSvgButton.addEventListener('click',()=>{
        const svgStr = getSvgContent(30,30,5)  // 30 virtual pixels on each side -> 150x150 actual pixels
        textAreaElem.value = svgStr
    })
    clearButton.addEventListener('click',()=>textAreaElem.value='')
    const scriptUrl = '../assets/js/day1/script.js'
    const svgUrl = '../assets/images/day1-static.svg'
    const pageUrl = './day1.html'
    commonUtilObj.insertTitledCodeAtPreexistingElement(
        svgImgRef,pageUrl,19,22,
        '<img> element tag referencing static SVG file (plus surrounding <div>)',true,'html')
    const SVG_LINES_TO_SHOW = 35
    commonUtilObj.insertTitledCodeAtPreexistingElement(
        svgCodeElem,svgUrl,1,SVG_LINES_TO_SHOW,
        'First ' + SVG_LINES_TO_SHOW + ' lines of day1-static.svg',true,'svg')
    commonUtilObj.insertTitledCodeAtPreexistingElement(
        makeSvgCodeElem,scriptUrl,36,84,
        'getSvgContent() from script.js',true,'js')
}

function getSvgContent(width,height,pixelSize) {
    const SVGNS = 'http://www.w3.org/2000/svg'  // This namespace is required in SVG files.
    const actualWidth = width*pixelSize
    const actualHeight = height*pixelSize
    let svgString = '<?xml version="1.0" encoding="utf-8"?>'  // XML header
    svgString += `\n<svg width="${actualWidth}" height="${actualHeight}" ` +
        `viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="${SVGNS}">`
    for (let row=0;row<height;row++) {
        const vertOffset = row*pixelSize  // offset in actual pixels from TOP
        const y = row/(height-1)
        for (let col=0;col<width;col++) {
            const horizOffset = col*pixelSize  // offset in actual pixels from LEFT
            const x = col/(width-1)  // convenience variable for calculating color
            const rr = x*x+y*y       // square of the distance from the upper left
            let colorHex
            if (rr > 0.8) {
                colorHex = '#ff8800'  // orange
            } else if (rr > 0.6) {
                colorHex = '#0088ff'  // medium blue
            } else {
                if (y > 0.4) {
                    colorHex = '#ff0000'  // red
                } else {
                    colorHex = '#00cc00'  // light green
                }
            }
            // Construct the XML/SVG element for a virtual pixel.  This will be
            // a square of 'pixelSize' on all four sides.  It is formatted in the SVG
            // file as a rectangle ('<rect ...') but is specifically square since 
            // its specified dimensions ('width=...', 'height=...') have the same
            // values.
            //
            // The 'x=' and 'y=' attributes in the XML/SVG element indicate how far
            // the rectangle (square in this case) is from the left and top margins,
            // respectively.
            //
            // The 'fill=' attribute specifies the color of the rectangle.  The optional
            // 'stroke=' and 'stroke-width=' attributes specify the color of the 
            // rectangles' borders and the width of those borders, respectively.
            let rectangleElemStr = 
                `\n  <rect x="${vertOffset}" y="${horizOffset}" ` +
                `width="${pixelSize}" height="${pixelSize}" ` +
                `stroke="#fff" stroke-width="1" fill="${colorHex}"/>`
            svgString += rectangleElemStr
        }
    }
    svgString += '\n</svg>\n'  // Complete the <svg> element that contains the <rect> elements
    return svgString;
}