import Sphere from "./sphere.js"
import Vector3D from "./vector3d.js"
import Ray from "./ray.js"

class RefractiveSphere extends Sphere {
    constructor(center,radius,color,refractiveIndex) {
        super(center,radius,color,new Vector3D(1,1,1))  // TODO - need to get lightV out of Sphere class
        if (typeof refractiveIndex !== 'number' || refractiveIndex <= 0) {
            throw 'invalid refractiveIndex'
        }
        this.refractiveIndex = refractiveIndex
        this.r2 = radius*radius
    }

    // interceptDistance() inherits from Sphere without alteration

    handle(ray) {
        const dist1 = this.rayDistToSphere(ray)  // TODO - how to eliminate duplicate calculation?
        if (dist1 === null || dist1 <= 0) {
            return ray.color
        }
        const dir = ray.getDirection()
        const surfaceVector1 = dir.scalarMult(dist1/dir.magn()).add(ray.getOrigin())
        const normVect = surfaceVector1.subt(this.center)
        const resultantDir1 = dir.refract(normVect,this.refractiveIndex)
        const resultantColor = ray.color
        const resultantRay1 = new Ray(surfaceVector1,resultantDir1,resultantColor)
        const dist2 = this.#raySecondDistToSphere(resultantRay1)
        const surfaceVector2 = surfaceVector1.add(resultantRay1.getDirection().normalized().scalarMult(dist2))
        const resultantDir2 = resultantDir1.refract(surfaceVector2.subt(this.center),1/this.refractiveIndex)
        const resultantRay2 = new Ray(
            surfaceVector2.add(resultantDir2.normalized().scalarMult(1e-9)),
            resultantDir2,resultantColor    
        )
        return resultantRay2
    }

    #raySecondDistToSphere(ray) {
        const C = this.center.subt(ray.getOrigin())
        const D = ray.getDirection()
        const CD = C.dot(D)
        const det = CD**2 - D.magnSqr()*(C.magnSqr()-this.r2)
        if (det <= 0) {
            return null
        }
        const detRoot = Math.sqrt(det)
        let k = CD + detRoot  // note the '+' which differs from the original formula
        if (k <= 0) {
            return null
        }
        k /= D.magn()
        return k
    }


}

export default RefractiveSphere