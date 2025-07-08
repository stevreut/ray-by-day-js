import Sphere from "../day20/sphere.js"
import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import { ScatteringUtils } from "./scatter.js"

class ReflectiveSphere extends Sphere {
    constructor(center,radius,color,scatter=0) {
        super(center,radius,color,new Vector3D(1,1,1))  // TODO - need to get lightV out of Sphere class
        if (typeof scatter === 'number') {  
            this.scatter = Math.min(0.99,Math.max(0,scatter))
        } else {
            this.scatter = 0
        }
        this.usingScatter = this.scatter > 0
    }
    // interceptDistance() inherits from Sphere without alteration
    handle(ray, interceptDistance = null) {
        const dist = interceptDistance ?? this.rayDistToSphere(ray)  // Use passed distance if available
        if (dist === null || dist <= 0) {
            return ray.color
        }
        const dir = ray.getDirection()
        let surfVect = dir.scalarMult(dist/dir.magn()).add(ray.getOrigin())
        let normVect = surfVect.subt(this.center)
        let resultantDir = dir.reflect(normVect)
        let resultantColor = ray.color.filter(this.color)
        let resultantRay = new Ray(surfVect,resultantDir,resultantColor)
        
        // Apply scattering if scatter is enabled
        if (this.usingScatter) {
            return ScatteringUtils.applyScattering(resultantRay, normVect, this.scatter, ray)
        }
        
        return resultantRay
    }
}

export default ReflectiveSphere