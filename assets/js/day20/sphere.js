import OpticalObject from "./optical-object.js";
import Color from "./color.js"

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
        const dist = this.rayDistToSphere(ray)  // TODO - how to eliminate duplicate calculation?
        if (dist === null || dist <= 0) {
            return ray.color
        }
        const dir = ray.getDirection()
        const surfaceVect = dir.scalarMult(dist/dir.magn()).add(ray.getOrigin())
        const normVect = surfaceVect.subt(this.center).normalized()
        let dotProd = this.lighting.dot(normVect)
        dotProd = Math.max(0,dotProd)
        dotProd = (dotProd*0.8)+0.2
        return ray.color.filter(this.color).scalarMult(dotProd)
    }

    rayDistToSphere(ray) {
        const C = this.center.subt(ray.getOrigin())
        const D = ray.getDirection()
        const CD = C.dot(D)
        const det = CD**2 - D.magnSqr()*(C.magnSqr()-this.#radiusSqr)
        if (det <= 0) {
            return null
        }
        const detRoot = Math.sqrt(det)
        let k = CD - detRoot
        if (k <= 0) {
            return null
        }
        k /= D.magn()
        return k
    }
    
}

export default Sphere 