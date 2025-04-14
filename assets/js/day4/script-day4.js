const svgAnchorID = "svghere"

const PIXELS_WIDTH = 160
const PIXELS_HEIGHT = 120
const PIXEL_SIZE = 5  // One VIRTUAL pixel = 5 screen pixels

onload = () => {
    const svgAnchor = document.getElementById(svgAnchorID)
    if (!svgAnchor) {
        throw 'no ' + svgAnchorID + 'id found on page'
    }
    svgAnchor.innerHTML = ''
    let svgElem = createSvgElemAt(svgAnchor)
    svgAnchor.appendChild(svgElem)
}

function createSvgElemAt(anch) {
    // TODO - first draft will create
    // graph using svgutils.js directly but ultimately
    // we will use svgutils.js only indirectly via
    // gridgraph.js
    //---
    const TRUE_WIDTH = PIXELS_WIDTH*PIXEL_SIZE
    const TRUE_HEIGHT = PIXELS_HEIGHT*PIXEL_SIZE
    const svgElem = makeSvgElem("svg",{
        width: TRUE_WIDTH,
        height: TRUE_HEIGHT,
        viewBox: '0 0 ' + TRUE_WIDTH + ' ' + TRUE_HEIGHT,
    })
    // TODO - temp
    makeSvgElem("rect",{
        x:0, y:0, width: TRUE_WIDTH, height:TRUE_HEIGHT,
        fill: 'red'
    },svgElem)
    // TODO - end temp
    for (let j=7;j<PIXELS_HEIGHT;j++) {  // TODO 7 -> 0
        for (let i=0;i<PIXELS_WIDTH;i++) {
            makeSvgRectangle(i*PIXEL_SIZE,j*PIXEL_SIZE,
                PIXEL_SIZE,PIXEL_SIZE,{
                    stroke$width: 1,
                    stroke: '#888',
                    fill: '#ddd'
                },svgElem
            )
        }
    }
    return svgElem
}


