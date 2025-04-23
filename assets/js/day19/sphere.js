import OpticalObject from "../day14/optical-object.js";

class Sphere extends OpticalObject {
    #radiusSqr
    constructor(center,radius) {
        super()
        // TODO - validation - accept on faith just for now
        this.center = center
        this.radius = radius
        this.#radiusSqr = radius**2 
    }

    interceptDistance(ray) {
        return this.rayDistToSphere(ray)
    }

    handle(ray) {
        return ray.color
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