import Sphere from "./sphere.js"
import Ray from "./ray.js"
import Color from "./color.js"

class ShadowedSphere extends Sphere {
    static WHITE_COLOR
    static {
        ShadowedSphere.WHITE_COLOR = new Color()
    }
    constructor(center,radius,color,lightingVector,opticalObjectArray) {
        super(center,radius,color,lightingVector)
        this.optObjArr = opticalObjectArray
    }
    handle(ray) {
        let dist = this.rayDistToSphere(ray)  // TODO - how to eliminate duplicate calculation?
        if (dist === null || dist <= 0) {
            return ray.color
        }
        const dir = ray.getDirection()
        let surfVect = dir.scalarMult(dist/dir.magn()).add(ray.getOrigin())
        let surfRay = new Ray(surfVect,this.lighting,ShadowedSphere.WHITE_COLOR)
        if (this.#isInShadow(surfRay)) {
            return this.color.scalarMult(0.2)
        } else {
            let normVect = surfVect.subt(this.center).normalized()
            let dot = this.lighting.dot(normVect)
            dot = Math.max(0,dot)*0.8+0.2
            return this.color.scalarMult(dot)
        }
    }

    #isInShadow(ray) {
        let isShadowed = false
        this.optObjArr.forEach(obj=>{
            if (!isShadowed && obj != this) {
                let dist = obj.interceptDistance(ray)
                if (dist !== null && dist > 0) {
                    isShadowed = true
                }
            }
        })
        return isShadowed
    }
}

export default ShadowedSphere

