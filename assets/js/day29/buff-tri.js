import Triangle from "../day23/triangle.js"
import Ray from "../day20/ray.js"
import { ScatteringUtils } from "./scatter.js"

class BuffTriangle extends Triangle {
    constructor (vertex1, vertex2, vertex3, color, scatter = 0) {
        super(vertex1, vertex2, vertex3, color)
        this.scatter = scatter
    }
    handle(ray) {
        const dist = super.interceptDistance(ray)  // TODO - generally
        const newDirection = ray.getDirection().reflect(this.planeNormalV)
        const newOrigin = ray.getOrigin().add(ray.getDirection().normalized().scalarMult(dist)).add(newDirection.normalized().scalarMult(1e-6))
        const newColor = ray.color.filter(this.color)
        const reflectedRay = new Ray(newOrigin,newDirection,newColor)
        
        // Apply scattering if scatter value is greater than 0
        return ScatteringUtils.applyScattering(reflectedRay, this.planeNormalV, this.scatter, ray)
    }
}

export default BuffTriangle 