import OpticalObject from "../day14/optical-object.js"
import Sphere from "../day14/sphere.js"
import Ray from "../day13/ray.js"

class ShadowedSphere extends Sphere {
    constructor(center,radius,color,lightingVector,opticalObjectArray) {
        super(center,radius,color,lightingVector)
        this.optObjArr = opticalObjectArray
        // if (!this.#validObjArray(this.obtObjArr)) {
        //     throw 'invalid opticalObjectArray parameter'
        // }
    }
    handle(ray) {
        let dist = this.rayDistToSphere(ray)  // TODO - how to eliminate duplicate calculation?
        if (dist === null || dist <= 0) {
            return ray.color
        }
        const dir = ray.getDirection()
        let surfVect = dir.scalarMult(dist/dir.magn()).add(ray.getOrigin())
        let surfRay = new Ray(surfVect,this.lighting,[1,1,1])
        if (this.#isInShadow(surfRay)) {
            let newColor = this.color.map(prim=>{return prim*0.2 /*TODO*/})
            return newColor
        } else {
            let normVect = surfVect.subt(this.center)
            normVect = normVect.scalarMult(1/normVect.magn())
            let dot = this.lighting.dot(normVect)
            dot = Math.max(0,dot)
            dot = (dot*0.8)+0.2  // TODO
            let newColor = this.color.map(prim=>{return prim*dot})
            return newColor
        }
    }

    #isInShadow(ray) {
        return false  // TODO
    }
    
    // #validObjArray(arr) {  // TODO - just delete this?
    //     if (!Array.isArray(arr)) {
    //         return false
    //     }
    //     let allValid = true
    //     arr.forEach(itm=>{
    //         if (!itm instanceof OpticalObject) {
    //             allValid = false
    //         }
    //     })
    //     return allValid
    // }
}

export default ShadowedSphere

