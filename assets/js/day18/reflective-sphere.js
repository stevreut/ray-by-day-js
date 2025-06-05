import Sphere from "../day15/sphere.js"
import Vector3D from "./vector3d.js"
import Ray from "./ray.js"

class ReflectiveSphere extends Sphere {
    constructor(center,radius,color) {
        super(center,radius,color,new Vector3D(1,1,1))  // TODO - need to get lightV out of Sphere class
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
        let resultantDir = dir.reflect(normVect)
        let resultantColor = ray.color.filter(this.color)
        let resultantRay = new Ray(surfVect,resultantDir,resultantColor)
        return resultantRay
    }
}

export default ReflectiveSphere