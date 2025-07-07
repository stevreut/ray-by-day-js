import Filter from "./filter.js"
import Color from "../day20/color.js"

class DirectionalFilter extends Filter {
    constructor(directionColor, oppositeColor, directionThreshold = 0.5) {
        super()
        if (!(directionColor instanceof Color)) {
            throw 'directionColor must be a Color instance'
        }
        if (!(oppositeColor instanceof Color)) {
            throw 'oppositeColor must be a Color instance'
        }
        if (typeof directionThreshold !== 'number' || directionThreshold < 0 || directionThreshold > 1) {
            throw 'directionThreshold must be between 0 and 1'
        }
        
        this.directionColor = directionColor
        this.oppositeColor = oppositeColor
        this.directionThreshold = directionThreshold
    }
    
    // No need to override interceptDistance() - uses base class implementation that returns 1
    
    modifyColor(ray, distance) {
        const rayDir = this.getRayDirection(ray)
        
        // Calculate how much the ray is pointing in the "forward" direction (negative Z)
        const forwardComponent = -rayDir.getZ()  // Negative because we want rays going "forward"
        
        // Interpolate between opposite and direction colors based on forward component
        let blendFactor = 0
        if (forwardComponent > this.directionThreshold) {
            blendFactor = (forwardComponent - this.directionThreshold) / (1 - this.directionThreshold)
            blendFactor = Math.min(blendFactor, 1)  // Clamp to 1
        }
        
        const originalColor = ray.color
        
        // Blend the two filter colors using available Color methods
        // blendFactor determines the mix between oppositeColor and directionColor
        const color1 = this.oppositeColor.scalarMult(1 - blendFactor)
        const color2 = this.directionColor.scalarMult(blendFactor)
        const interpolatedFilterColor = color1.add(color2)
        
        // Apply the filter color to the original color using the filter method
        const finalColor = originalColor.filter(interpolatedFilterColor.scalarMult(0.3).add(new Color(0.7, 0.7, 0.7)))
        
        return finalColor
    }
}

export default DirectionalFilter 