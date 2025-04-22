import Vector3D from "../day12/vector3d.js"
import GridGraph from "../day6a/gridgraph.js"
import BiVariantGrapher from "../day6a/bivargrapher.js"
import Ray from "../day13/ray.js"
// import OpticalObject from "./optical-object.js"
import Sphere from "./sphere.js"

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
    const grapher = new BiVariantGrapher(gridder,800,600,1,260,f,3)
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
        let dist = sph.interceptDistance(ray)
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
        return spheres[leastSphere].handle(ray)
    }
}

function initRandomSpheres() {
    spheres = []
    const SPH_COUNT = 12
    for (let i=0;i<SPH_COUNT;i++) {
        let sphere = new Sphere(randomCenter(),(Math.random()+1)*1.125,randomColor(),new Vector3D(1,1,-0.5))
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