import Sphere from "./sphere.js"
import Ray from "../day17/ray.js"

class RefractiveSphere extends Sphere {
    constructor(center,radius,indexOfRefraction) {
        super(center,radius)
    }
    // interceptDistance() stands from super without modification
    handle(ray) {
        const dist = this.rayDistToSphere(ray)
        if (typeof dist !== 'number' || dist <= 0) {
            throw 'unexpected non-numeric or non-negative distance'
        }
        // TODO - strictly an a naive intermediate implementation, 
        // do not refract the ray at all.  Simply let it pass through, 
        // but alter the color so as to indicate it as done so.  Later we will
        // tinker with the refraction calculation.
        // Related:  The origin of the ray will still have to be altered so that
        // it moves on to subsequent objects.
        // TODO - end of temp comment
        let newRay = new Ray(ray.getOrigin(),ray.getDirection(),[ray.color[0]*0.5,ray.color[1]*0.5,ray.color[2]*0.5])
        return newRay
    }
}

export default RefractiveSphere