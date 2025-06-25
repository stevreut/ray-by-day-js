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
    
    // Set up validation for inputs
    setupInputValidation()
    
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
        "Beginning of embedded SVG content (plus header, etc.)",true)
    commonUtilsObj.insertTitledCodeAtPreexistingElement('randomchgcode',
        scriptUrl,10,20,"day2/script.js",true)
    commonUtilsObj.insertTitledCodeAtPreexistingElement('specchgcode',scriptUrl,25,33,
        'day2/script.js',true)
}

function setupInputValidation() {
    const colorInput = document.getElementById('txtcolor')
    const rowInput = document.getElementById('txtrow')
    const colInput = document.getElementById('txtcol')
    
    // Color input validation
    if (colorInput) {
        colorInput.addEventListener('input', validateColorInput)
        colorInput.addEventListener('blur', padColorInput)
        colorInput.addEventListener('keypress', preventInvalidColorChars)
    }
    
    // Row and column input validation
    if (rowInput) {
        rowInput.addEventListener('input', validateNumericInput)
        rowInput.addEventListener('blur', validateRowRange)
    }
    
    if (colInput) {
        colInput.addEventListener('input', validateNumericInput)
        colInput.addEventListener('blur', validateColRange)
    }
}

function validateColorInput(event) {
    const input = event.target
    let value = input.value
    
    // Ensure it always starts with #
    if (!value.startsWith('#')) {
        value = '#' + value
    }
    
    // Remove any characters that aren't hex digits (keep the #)
    const hexPart = value.substring(1).replace(/[^0-9a-fA-F]/g, '')
    value = '#' + hexPart
    
    // Limit to 7 characters (# + 6 hex digits)
    if (value.length > 7) {
        value = value.substring(0, 7)
    }
    
    input.value = value
}

function preventInvalidColorChars(event) {
    const char = event.key
    const currentValue = event.target.value
    
    // Allow backspace, delete, arrow keys, etc.
    if (event.key.length > 1) return
    
    // Prevent deletion of the # character
    if (event.key === 'Backspace' && currentValue === '#') {
        event.preventDefault()
        return
    }
    
    // Allow hex digits (0-9, a-f, A-F) after #
    if (/[0-9a-fA-F]/.test(char)) return
    
    // Prevent all other characters
    event.preventDefault()
}

function padColorInput(event) {
    const input = event.target
    let value = input.value
    
    // Ensure it starts with #
    if (!value.startsWith('#')) {
        value = '#'
    }
    
    // Pad with zeros to make it 7 characters (# + 6 hex digits)
    const hexPart = value.substring(1)
    const paddedHex = hexPart.padEnd(6, '0')
    value = '#' + paddedHex
    
    input.value = value
}

function validateNumericInput(event) {
    const input = event.target
    let value = input.value
    
    // Remove any non-numeric characters
    value = value.replace(/[^0-9]/g, '')
    
    input.value = value
}

function validateRowRange(event) {
    const input = event.target
    let value = parseInt(input.value) || 0
    
    // Clamp to valid range (0-19)
    value = Math.max(0, Math.min(19, value))
    
    input.value = value
}

function validateColRange(event) {
    const input = event.target
    let value = parseInt(input.value) || 0
    
    // Clamp to valid range (0-19)
    value = Math.max(0, Math.min(19, value))
    
    input.value = value
}

function getRandomColor() {
    let color = '#'
    for (let i=0;i<3;i++) {
        color += Math.floor(Math.random()*255).toString(16).padStart(2,'0')
    }
    return color
}