import CodeExtractor from "../utils/code-extractor.js"
import CodeFormatter from "../utils/code-formatter.js"

let codex = null
let codef = null

onload = async function() {
    codex = new CodeExtractor()
    codef = new CodeFormatter()
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
    insertTitledCodeAtPreexistingElementById('svgcode','./day2.html',24,38,
        "Beginning of embedded SVG content (plus ...)",true)
    const scriptUrl = '../assets/js/day2/script.js'
    insertTitledCodeAtPreexistingElementById('randomchgcode',
        scriptUrl,14,24,"script.js ...",true)
    insertTitledCodeAtPreexistingElementById('specchgcode',scriptUrl,27,32,
        'script.js ...',true)
}

async function insertTitledCodeAtPreexistingElementById(id,codeFileName,firstLine,lastLine,title,doLeftShift) {
    if (!codex || !codef) {
        console.error ('required objects not found')
        return
    }
    const element = document.getElementById(id)
    if (!element) {
        console.error('no id=', id, ' found for code insertion')
        return
    }
    const codeLinesAsString = await codex.getCodeLines(codeFileName,firstLine,lastLine)
    if (!codeLinesAsString) {
        console.error('error retrieving code lines from ', codeFileName)
        return
    }
    element.replaceWith(codef.formatTitledExcerptElement(title,codeLinesAsString,doLeftShift))
}

function getRandomColor() {
    let color = '#'
    for (let i=0;i<3;i++) {
        color += Math.floor(Math.random()*255).toString(16).padStart(2,'0')
    }
    return color
}