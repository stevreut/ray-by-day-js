import OpticalObject from "./optical-object.js";
import Color from "../day14/color.js"

class Sphere extends OpticalObject {
    #radiusSqr
    constructor(center,radius,color,lightingVector) {
        super()
        // TODO - validation - accept on faith just for now
        this.center = center
        this.radius = radius
        this.#radiusSqr = radius**2
        if (!(color instanceof Color)) {
            throw 'not a Color object'
        } 
        this.color = color
        this.lighting = lightingVector.normalized()
    }

    interceptDistance(ray) {
        return this.rayDistToSphere(ray)
    }

    handle(ray) {
        let dist = this.rayDistToSphere(ray)  // TODO - how to eliminate duplicate calculation?
        if (dist === null || dist <= 0) {
            return ray.color
        }
        const dir = ray.getDirection()
        let surfVect = dir.scalarMult(dist/dir.magn()).add(ray.getOrigin())
        let normVect = surfVect.subt(this.center).normalized()
        let dot = this.lighting.dot(normVect)
        dot = Math.max(0,dot)
        dot = (dot*0.8)+0.2
        return this.color.scalarMult(dot)
    }

    rayDistToSphere(ray) {
        let C = this.center.subt(ray.getOrigin())
        let D = ray.getDirection()
        let CD = C.dot(D)
        let det = CD**2 - D.magnSqr()*(C.magnSqr()-this.#radiusSqr)
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
    
}

export default Sphere 