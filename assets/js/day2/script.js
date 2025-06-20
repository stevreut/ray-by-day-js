import CommonCodeUtility from "../utils/code-ext/code-common.js"

let commonUtilsObj = new CommonCodeUtility()

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
    const changeSpecificCellButton = document.getElementById('setcolorbtn')
    if (changeSpecificCellButton) {
        changeSpecificCellButton.addEventListener('click',()=>{
            const rects = document.querySelectorAll('svg rect')
            const idx = parseInt(document.getElementById('txtrow').value)*20 +
                parseInt(document.getElementById('txtcol').value)
            rects[idx].setAttribute('fill',document.getElementById('txtcolor').value)    
        })
    }
    const pageUrl = './day2.html'
    const scriptUrl = '../assets/js/day2/script.js'
    commonUtilsObj.insertTitledCodeAtPreexistingElement('svgcode',pageUrl,24,38,
        "Beginning of embedded SVG content (plus ...)",true)
    commonUtilsObj.insertTitledCodeAtPreexistingElement('randomchgcode',
        scriptUrl,10,20,"script.js ...",true)
    commonUtilsObj.insertTitledCodeAtPreexistingElement('specchgcode',scriptUrl,23,28,
        'script.js ...',true)
}

function getRandomColor() {
    let color = '#'
    for (let i=0;i<3;i++) {
        color += Math.floor(Math.random()*255).toString(16).padStart(2,'0')
    }
    return color
}