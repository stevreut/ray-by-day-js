import Triangle from "./triangle.js"
import Ray from "../day20/ray.js"

class ReflectiveTriangle extends Triangle {
    constructor (vertex1, vertex2, vertex3, color) {
        super(vertex1, vertex2, vertex3, color)
    }
    handle(ray) {
        const dist = super.interceptDistance(ray)  // TODO - generally
        const newDirection = ray.getDirection().reflect(this.planeNormalV)
        const newOrigin = ray.getOrigin().add(ray.getDirection().normalized().scalarMult(dist)).add(newDirection.normalized().scalarMult(1e-6))
        const newColor = ray.color.filter(this.color)
        const newRay = new Ray(newOrigin,newDirection,newColor)
        return newRay
    }
}

export default ReflectiveTriangle