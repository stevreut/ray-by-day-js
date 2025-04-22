import Vector3D from "../day12/vector3d.js"
import GridGraph from "../day6a/gridgraph.js"
import BiVariantGrapher from "../day6a/bivargrapher.js"
import Ray from "./ray.js"

const IMG_PARA_ID = 'imgpara'
let imgParagraph = null

onload = () => {
    imgParagraph = document.getElementById(IMG_PARA_ID)
    if (!imgParagraph) {
        throw 'no ' + IMG_PARA_ID + ' id found on page'
    }
    initRandomSpheres()
    imgParagraph.innerHTML = ''
    const gridder = new GridGraph()
    const grapher = new BiVariantGrapher(gridder,400,300,2,130,f,2)
    let svgElem = grapher.drawGraph()
    imgParagraph.appendChild(svgElem)
}

let spheres = []

const universalOrigin = new Vector3D(0,0,-30)

function f(x,y) {
    const ray = new Ray(universalOrigin,new Vector3D(x,y,4))
    let leastDist = null
    let leastSphere = null
    spheres.forEach((sph,idx)=>{
        let dist = rayDistToSphere(ray,sph)
        if (dist !== null) {
            if (dist > 0 && (leastDist == null || dist < leastDist)) {
                leastDist = dist
                leastSphere = idx
            }
        }
    })
    if (leastSphere === null) {
        return [0.2,0.2,0.4]
    } else {
        return spheres[leastSphere].color
    }
}

function rayDistToSphere(ray,sph) {
    let C = sph.centerV.subt(ray.getOrigin())
    let D = ray.getDirection()
    let CD = C.dot(D)
    let det = CD**2 - D.magnSqr()*(C.magnSqr()-sph.radius**2)
    if (det <= 0) {
        return null
    }
    let detRoot = Math.sqrt(det)
    let k = CD - detRoot
    if (k <= 0) {
        return null
    }
    k /= D.magn()
    return k
}

function initRandomSpheres() {
    spheres = []
    const SPH_COUNT = 10
    for (let i=0;i<SPH_COUNT;i++) {
        let sphere = {}
        sphere.radius = 2.5
        sphere.centerV = randomCenter()
        sphere.color = randomColor()
        spheres.push(sphere)
    }
}

function randomCenter() {
    let arr = []
    for (let i=0;i<3;i++) {
        arr.push((Math.random()-0.5)*10)
    }
    let ctr = new Vector3D(arr)
    return ctr
}

function randomColor() {
    let arr = []
    for (let i=0;i<3;i++) {
        arr.push(Math.round(Math.random()*120+120)/255)
    }
    return arr
}