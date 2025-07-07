import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import OpticalObject from "../day20/optical-object.js"

class Filter extends OpticalObject {
    constructor() {
        super()
    }
    
    /**
     * Default implementation that always returns 1 to trigger handle() method.
     * Subclasses can override this to implement more specific intersection logic
     * (e.g., radius limits, directional constraints, etc.).
     * @param {Ray} ray - The incident ray
     * @returns {number} - Always returns 1 to trigger handle() method
     */
    interceptDistance(ray) {
        return 1
    }
    
    /**
     * Base implementation - subclasses should override this
     * @param {Ray} ray - The incident ray
     * @param {number} distance - Distance to intersection point (always 1 for default filters)
     * @returns {Ray|Color} - Modified ray or final color
     */
    handle(ray, distance) {
        // Default behavior: return ray with modified color
        const modifiedColor = this.modifyColor(ray, distance)
        return new Ray(ray.getOrigin(), ray.getDirection(), modifiedColor)
    }
    
    /**
     * Abstract method that subclasses must implement
     * @param {Ray} ray - The incident ray
     * @param {number} distance - Distance to intersection point
     * @returns {Color} - The modified color
     */
    modifyColor(ray, distance) {
        throw new Error('modifyColor() must be implemented by subclass')
    }
    
    /**
     * Helper method to get intersection point
     * @param {Ray} ray - The incident ray
     * @param {number} distance - Distance to intersection point
     * @returns {Vector3D} - The intersection point
     */
    getIntersectionPoint(ray, distance) {
        return ray.getOrigin().add(ray.getDirection().normalized().scalarMult(distance))
    }
    
    /**
     * Helper method to get ray direction at intersection
     * @param {Ray} ray - The incident ray
     * @returns {Vector3D} - The normalized ray direction
     */
    getRayDirection(ray) {
        return ray.getDirection().normalized()
    }
}

export default Filter 