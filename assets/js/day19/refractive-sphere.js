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
        let dist = this.rayDistToSphere(ray)  // TODO - how to eliminate duplicate calculation?
        if (dist === null || dist <= 0) {
            return ray.color
        }
        const dir = ray.getDirection()
        let surfVect = dir.scalarMult(dist/dir.magn()).add(ray.getOrigin())
        let normVect = surfVect.subt(this.center)
        let resultantDir = dir.refract(normVect,this.refractiveIndex)
        // let resultantColor = this.color.map((prim,idx)=>{
        //     return prim*ray.color[idx]
        // })
        let resultantColor = ray.color  // TODO - temporary
        // let newOrigin = surfVect.add(resultantDir.normalized().scalarMult(1E-9))  // TODO
        let newOrigin = surfVect
        let resultantRay1 = new Ray(newOrigin,resultantDir,resultantColor)
        let dist2 = this.#raySecondDistToSphere(resultantRay1)
        let surfVect2 = newOrigin.add(resultantRay1.getDirection().normalized().scalarMult(dist2))
        let resultantDir2 = surfVect2.refract(surfVect2.subt(this.center),1/this.refractiveIndex)
        let resultantRay2 = new Ray(
            surfVect2.add(resultantDir2.normalized().scalarMult(1e-9)),
            resultantDir2,resultantColor    
        )
        return resultantRay2
    }

    #raySecondDistToSphere(ray) {
        let C = this.center.subt(ray.getOrigin())
        let D = ray.getDirection()
        let CD = C.dot(D)
        let det = CD**2 - D.magnSqr()*(C.magnSqr()-this.r2)
        if (det <= 0) {
            return null
        }
        let detRoot = Math.sqrt(det)
        let k = CD + detRoot  // note the '+' which differs from the original formula
        if (k <= 0) {
            return null
        }
        k /= D.magn()
        return k
    }


}

export default RefractiveSphere