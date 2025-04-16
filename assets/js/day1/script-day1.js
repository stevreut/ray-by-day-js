import CodeExtractor from "../utils/code-extractor.js"

onload = async function() {
    const makeSvgButton = document.getElementById('makesvgbtn')
    const textAreaElem = document.getElementById('svgtextarea')
    const clearButton = document.getElementById('clearbtn')
    const svgCodeElem = document.getElementById('svgcode')
    if (!(makeSvgButton && textAreaElem && clearButton && svgCodeElem)) {
        throw 'missing expected id(s)'
    }
    makeSvgButton.addEventListener('click',()=>{
        svgStr = getSvgContent()
        textAreaElem.value = svgStr
    })
    clearButton.addEventListener('click',()=>textAreaElem.value='')
    let codex = new CodeExtractor()
    let str = await codex.getCodeLines('../assets/images/day1-static.svg',3,10)  // TODO
    console.log('str = ', str)  // TODO
}

function getSvgContent() {
    const SVGNS = 'http://www.w3.org/2000/svg'
    const WID = 150
    const HGT = 150
    const MINDIM = Math.min(WID,HGT)
    let svg = '<?xml version="1.0" encoding="utf-8"?>'
    svg += '\n<svg width="' + WID + '" height="' + HGT + '" '
    svg += 'viewBox="0 0 ' + WID + ' ' + HGT + '" '
    svg += 'xmlns="' + SVGNS + '">'
    for (let row=0;row<HGT;row+=10) {
        for (let col=0;col<WID;col+=10) {
            let rect = '<rect x="' + col + '" y="' + row + 
                '" width="10" height="10" stroke="#888" fill="'
            if (col**2+row**2 < MINDIM**2) {
                rect += '#0088ff'
            } else {
                rect += '#aabbaa'
            }
            rect += '"/>'
            svg += '\n  ' + rect
        }
    }
    svg += '\n</svg>\n'
    return svg;
}