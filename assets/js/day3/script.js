import CommonCodeUtility from "../utils/code-ext/code-common.js"
import { innerPixelWidth } from "../utils/dom-utils.js"

const svgAnchorID = "svghere"
const selectID = "idselect"
const CODE_EXC_ID = 'dynsvgcode'
const CODE_EXC_ID2 = 'dynsvgcode2'

let commonUtilObj = null

onload = () => {
    commonUtilObj = new CommonCodeUtility()
    const svgAnchor = document.getElementById(svgAnchorID)
    if (!svgAnchor) {
        throw 'no ' + svgAnchorID + 'id found on page'
    }
    svgAnchor.innerHTML = ''
    let svgElem = createSvgElemAt(svgAnchor)
    setDropDown(selectID)
    const scriptUrl = '../assets/js/day3/script.js'
    commonUtilObj.insertTitledCodeByPattern(CODE_EXC_ID, scriptUrl, 'const SVGNS = \'', { regex: /}/, occurrence: 5 }, 'script.js - dynamic SVG creation in DOM', true, 'js')
    const colorPattern = "const " + "color = "
    commonUtilObj.insertUntitledCodeByPattern(CODE_EXC_ID2, scriptUrl, colorPattern, { linesAfter: 0 }, true, 'js')
}

const SVGNS = 'http://www.w3.org/2000/svg'
const DIM = 160
const SUBDIM = 8

function createSvgElemAt(anch) {
    // IMPORTANT:  Note the use of createElementNS() rather than
    // createElement()
    // Responsive width: up to 800px
    const container = anch.parentElement;
    let targetWidth = 800;
    if (container) {
        const w = innerPixelWidth(container);
        if (w > 0) targetWidth = Math.min(w, 800);
    }
    // Maintain aspect ratio (square)
    const targetHeight = targetWidth;
    const svg = document.createElementNS(SVGNS,'svg')
    svg.setAttribute('width', targetWidth)
    svg.setAttribute('height', targetHeight)
    svg.setAttribute('viewBox', '0 0 ' + DIM + ' ' + DIM)
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    const elemsAcross = Math.floor(DIM/SUBDIM)
    for (let row=0;row<elemsAcross;row++) {
        for (let col=0;col<elemsAcross;col++) {
            createRectangleAt(row,col,svg)
        }
    }
    anch.appendChild(svg)
    return svg
}

function createRectangleAt(r,c,svgParent) {
    // IMPORTANT:  Note the use of createElementNS() rather than
    // createElement()
    const rect = document.createElementNS(SVGNS,"rect")
    rect.setAttribute('x',c*SUBDIM)
    rect.setAttribute('y',r*SUBDIM)
    rect.setAttribute('width',SUBDIM)
    rect.setAttribute('height',SUBDIM)
    rect.setAttribute('stroke','#888')
    // 'c' and 'r' are our column and row, respectively.
    // Based on the two values, we determine the color
    // of the 'virtual pixel' (SVG <rect> element)
    const color = (c**2+r**2<300?'#0088ff':'#aabbaa')
    rect.setAttribute('fill',color)
    // Here we attach in id attribute of the form 'r1c1' where 
    // the number after 'r' is the row and the number after 'c' 
    // is the column.  
    const id = 'r'+r+'c'+c
    rect.setAttribute('id',id)
    svgParent.appendChild(rect)
}

function setDropDown(id) {
    const selectElem = document.getElementById(id)
    if (!selectElem) {
        throw 'no ' + id + ' id found'
    }
    selectElem.innerHTML = ''  // a precaution, but should not be populated
    const rects = document.querySelectorAll('svg rect')
    rects.forEach(rect=>{
        const rectId = rect.getAttribute('id')
        if (rectId) {
            const option = document.createElement('option')
            option.value = rectId
            option.textContent = rectId
            selectElem.appendChild(option)
        }
    })
    selectElem.addEventListener('change',()=>{
        const elem = document.getElementById(selectElem.value)
        if (elem) {
            elem.setAttribute('fill','red')
        } else {
            throw 'no element found for selected id "' + selectElem.value + '"'
        }
    })
}

