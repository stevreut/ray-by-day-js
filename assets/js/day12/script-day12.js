import Vector3D from "./vector3d.js"

onload = () => {
    let vFromArr = new Vector3D([1,2,3])
    logToPage('vFromArr = ' + vFromArr)
    let vNull = new Vector3D()
    logToPage('vNull = ' + vNull)
    let vNums = new Vector3D(4,5,-5)
    logToPage('vNums = ' + vNums)
    let vSum = vFromArr.add(vNums)
    logToPage('vSum = ' + vSum)
    let vMult = vSum.scalarMult(3)
    logToPage('vMult = ' + vMult)
    let dotVec = vFromArr.dot(vNums)
    logToPage('dotVec = ' + dotVec)
    let crossVec = vFromArr.cross(vNums)
    logToPage('crossVec = ' + crossVec)
    logToPage('mgn:crossVec = ' + crossVec.magn())
    logToPage('mgn2:crossVec = ' + crossVec.magnSqr())

}

function logToPage(str) {
    let para = document.createElement('p')
    let body = document.querySelector('body')
    para.textContent = 'Logged: ' + str
    body.appendChild(para)
}