import OpticalObject from "../day20/optical-object.js"
import OpticalEnvironment from "../day20/optical-env.js"  // TODO - might not need

class OpticalObjectGroup extends OpticalObject {
    #radiusSqr
    constructor(center,radius,objList) {
        super()
        this.center = center  // TODO - validation, must be Vector3D
        this.radius = radius  // TODO - validation, must be positive number
        this.#radiusSqr = radius**2
        if (!Array.isArray(objList)) {
            throw 'objList is not an array'
        }
        this.env = new OpticalEnvironment()
        objList.forEach(obj=>{
            this.addComponentObject(obj)
        })
    }
    addComponentObject(obj) {
        if (!obj || !(obj instanceof OpticalObject)) {  // TODO - is the 1st of these 2 tests necessary?
            throw 'attempt to add other than OpticalObject'
        }
        this.env.addOpticalObject(obj)
    }
    interceptDistance(ray) {
        if (!this.#withinEnvelope(ray)) {
            return null
        }
        const { leastDist } = this.env.getLeastDistanceObject(ray)
        return leastDist
    }
    handle(ray, interceptDistance = null) {
        const { leastDist, leastDistObj } = this.env.getLeastDistanceObject(ray)
        if (leastDist === null || leastDistObj === null) {
            console.error('unexpected null least dist obj on handle - continuing')
            return null
        }
        return leastDistObj.handle(ray, leastDist)
    }
    #withinEnvelope(ray) {
        // Note that this version varies slightly from Sphere.rayDistToSphere()
        // which had originally been used, both in terms of return type and
        // in terms of the specific case of when the ray originates from
        // within the sphere.
        const C = this.center.subt(ray.getOrigin())
        const D = ray.getDirection()
        const CD = C.dot(D)
        const det = CD**2 - D.magnSqr()*(C.magnSqr()-this.#radiusSqr)
        // Note that we have managed to get around calculating sqrt(det)
        // (a resource-consuming operation) since we are only looking 
        // for a boolean - which can be determined without the sqrt().
        if (CD >= 0) {
            return (det >= 0)
        } else {
            return (det >= -CD)
        }
    }


}

export default OpticalObjectGroup