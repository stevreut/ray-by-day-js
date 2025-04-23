import Sphere from "../day14/sphere.js"
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
        let resultantColor = this.color.map((prim,idx)=>{
            return prim*ray.color[idx]
        })
        let resultantRay = new Ray(surfVect,resultantDir,resultantColor)
        return resultantRay
        // normVect = normVect.scalarMult(1/normVect.magn())
        // let dot = this.lighting.dot(normVect)
        // dot = Math.max(0,dot)
        // dot = (dot*0.8)+0.2  // TODO
        // let newColor = this.color.map(prim=>{return prim*dot})
        // return newColor
    }

}

export default ReflectiveSphere