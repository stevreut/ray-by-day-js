function makeSvgElem(name,attribs,svgParent) {
    const SVGNS = 'http://www.w3.org/2000/svg'
    if (!name) {
        name = 'svg'
    }
    const isSvg = (name.toLowerCase().trim() === 'svg')
    let elem = document.createElementNS(SVGNS,name)
    if (attribs) {
        for (let key in attribs) {
            const attName = key.replace(/\$/g,'-')
            const value = attribs[key]
            elem.setAttribute(attName,value)
        }
        if (isSvg && !elem.getAttribute('version')) {
            elem.setAttribute('version','1.1')  // TODO ?
        }
    }
    if (svgParent) {
        svgParent.appendChild(elem)
    }
    return elem
}

function makeSvgRectangle (x0,y0,width,height,attribs,svgParent) {
    let newAttribs = { 
        x:x0, y:y0, width:width, height:height
    }
    if (attribs) {
        newAttribs = { ...newAttribs, ...attribs }
    }
    let rect = makeSvgElem("rect",newAttribs,svgParent)
    return rect
}

export { makeSvgElem, makeSvgRectangle }