import CodeExtractor from "../utils/code-extractor.js"
import CodeFormatter from "../utils/code-formatter.js"

onload = async function() {
    const randomChangeButton = document.getElementById('chgbtn')
    if (!randomChangeButton) {
        throw 'no chgbtn id on page'
    }
    randomChangeButton.addEventListener('click',()=>{
        const rects = document.querySelectorAll('svg rect')
        if (rects) {
            const rectCount = rects.length
            if (rectCount) {
                const randomIdx = Math.floor(Math.random()*rectCount)
                const randomColor = getRandomColor()
                rects[randomIdx].setAttribute('fill',randomColor)
            }
        }
    })
    const colorButton = document.getElementById('setcolorbtn')
    if (colorButton) {
        colorButton.addEventListener('click',()=>{
            const rects = document.querySelectorAll('svg rect')
            const idx = parseInt(document.getElementById('txtrow').value)*20 +
                parseInt(document.getElementById('txtcol').value)
            rects[idx].setAttribute('fill',document.getElementById('txtcolor').value)    
        })
    }
    const codex = new CodeExtractor()
    const codef = new CodeFormatter()
    if (codex && codef) {
        const svgCodeElem = document.getElementById('svgcode')
        if (svgCodeElem) {
            const linesStr = await codex.getCodeLines('./day2.html',24,38)
            svgCodeElem.replaceWith(codef.formatTitledExcerptElement("Beginning of embedded SVG content (plus ...)",linesStr,true))
        }
        const randomChangeCodeElem = this.document.getElementById('randomchgcode')
        if (randomChangeCodeElem) {
            const randomChangeCodeLines = await codex.getCodeLines('../assets/js/day2/script.js',9,19)
            randomChangeCodeElem.replaceWith(codef.formatTitledExcerptElement("script.js ...",randomChangeCodeLines,true))
        }
        const specChangeElem = this.document.getElementById('specchgcode')
        if (specChangeElem) {
            const specifiedCodeLines = await codex.getCodeLines('../assets/js/day2/script.js',22,27)
            specChangeElem.replaceWith(codef.formatTitledExcerptElement("script.js ...",specifiedCodeLines,true))
        }
    }
}

function getRandomColor() {
    let color = '#'
    for (let i=0;i<3;i++) {
        color += Math.floor(Math.random()*255).toString(16).padStart(2,'0')
    }
    return color
}