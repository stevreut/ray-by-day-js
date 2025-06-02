import CodeExtractor from "../utils/code-extractor.js"
import CodeFormatter from "../utils/code-formatter.js"

onload = async function() {
    const makeSvgButton = document.getElementById('makesvgbtn')
    const textAreaElem = document.getElementById('svgtextarea')
    const clearButton = document.getElementById('clearbtn')
    let svgImgRef = document.getElementById('imgrefcode')
    const svgCodeElem = document.getElementById('svgcode')
    const makeSvgCodeElem = this.document.getElementById('makesvgcode')
    if (!(makeSvgButton && textAreaElem && clearButton && svgImgRef && 
        svgCodeElem && makeSvgCodeElem)) {
            throw 'missing expected id(s)'
    }
    makeSvgButton.addEventListener('click',()=>{
        const svgStr = getSvgContent()
        textAreaElem.value = svgStr
    })
    clearButton.addEventListener('click',()=>textAreaElem.value='')
    let codex = new CodeExtractor()
    let codef = new CodeFormatter()
    let str1 = await codex.getCodeLines('./day1.html',13,14)
    // svgImgRef.textContent = str1 + ' ...'
    svgImgRef = codef.formatTitledExcerptElement("HTML excerpt...",str1)
    let str2 = await codex.getCodeLines('../assets/images/day1-static.svg',1,10)
    svgCodeElem.textContent = str2 + '  ...'
    let str3 = await codex.getCodeLines('../assets/js/day1/script.js',28,52)
    makeSvgCodeElem.textContent = str3
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