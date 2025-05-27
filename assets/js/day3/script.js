const svgAnchorID = "svghere"
const selectID = "idselect"

const SVGNS = 'http://www.w3.org/2000/svg'
const DIM = 150
const SUBDIM = 10
const elemsAcross = Math.floor(DIM/SUBDIM)

onload = () => {
    const svgAnchor = document.getElementById(svgAnchorID)
    if (!svgAnchor) {
        throw 'no ' + svgAnchorID + 'id found on page'
    }
    svgAnchor.innerHTML = ''
    let svgElem = createSvgElemAt(svgAnchor)
    setDropDown(selectID)
}

function createSvgElemAt(anch) {
    const svg = document.createElementNS(SVGNS,'svg')
    svg.setAttribute('width', DIM*2)
    svg.setAttribute('height', DIM*2)
    svg.setAttribute('viewBox', '0 0 ' + DIM + ' ' + DIM)
    // const testRect = document.createElementNS(SVGNS,'rect')
    // testRect.setAttribute('width', DIM)
    // testRect.setAttribute('height',DIM)
    // testRect.setAttribute('x',0)
    // testRect.setAttribute('y',0)
    // testRect.setAttribute('fill','red')
    // svg.appendChild(testRect)
    for (let row=0;row<elemsAcross;row++) {
        for (let col=0;col<elemsAcross;col++) {
            createRectangleAt(row,col,svg)
        }
    }
    anch.appendChild(svg)
    return svg
}

function createRectangleAt(r,c,svgParent) {
    const rect = document.createElementNS(SVGNS,"rect")
    rect.setAttribute('x',c*SUBDIM)
    rect.setAttribute('y',r*SUBDIM)
    rect.setAttribute('width',SUBDIM)
    rect.setAttribute('height',SUBDIM)
    rect.setAttribute('stroke','#888')
    const color = (c**2+r**2<225?'#0088ff':'#aabbaa')
    rect.setAttribute('fill',color)
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

