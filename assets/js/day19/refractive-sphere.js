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
        let resultantColor = this.color  // TODO - temporary
        let newOrigin = surfVect.add(resultantDir.normalized().scalarMult(1E-9))  // TODO
        let resultantRay = new Ray(newOrigin,resultantDir,resultantColor)
        return resultantRay
    }

}

export default RefractiveSphere