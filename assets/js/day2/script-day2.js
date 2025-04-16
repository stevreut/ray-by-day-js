import CodeExtractor from "../utils/code-extractor.js"

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
            const idx = parseInt(document.getElementById('txtrow').value)*15 +
                parseInt(document.getElementById('txtcol').value)
            rects[idx].setAttribute('fill',document.getElementById('txtcolor').value)    
        })
    }
    const svgCodeElem = document.getElementById('svgcode')
    if (svgCodeElem) {
        const codex = new CodeExtractor()
        let linesStr = await codex.getCodeLines('./day2.html',14,26)
        linesStr += '  ...'
        svgCodeElem.textContent = linesStr
    }
}

function getRandomColor() {
    let color = '#'
    for (let i=0;i<3;i++) {
        color += Math.floor(Math.random()*255).toString(16).padStart(2,'0')
    }
    return color
}