import Triangle from "./triangle.js"
import Ray from "../day19/ray.js"

class ReflectiveTriangle extends Triangle {
    constructor (vertex1, vertex2, vertex3, color) {
        super(vertex1, vertex2, vertex3, color)
    }
    handle(ray) {
        const dist = super.interceptDistance(ray)  // TODO - generally
        const newDirection = ray.getDirection().reflect(this.planeNormalV)
        const newOrigin = ray.getOrigin().add(ray.getDirection().normalized().scalarMult(dist)).add(newDirection.normalized().scalarMult(1e-6))
        const newColor = []
        for (let i=0;i<3;i++) {
            newColor.push(this.color[i]*ray.color[i])
        }
        const newRay = new Ray(newOrigin,newDirection,newColor)
        return newRay
    }
}

export default ReflectiveTriangle