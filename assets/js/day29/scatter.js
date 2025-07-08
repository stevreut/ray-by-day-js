import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"

export class ScatteringUtils {
    static applyScattering(reflectedRay, surfaceNormal, scatterValue, incidentRay) {
        if (scatterValue <= 0) {
            return reflectedRay
        }
        
        const scatter = Math.min(0.99, scatterValue)
        const originalDirection = reflectedRay.getDirection()
        const directionMagnitude = originalDirection.magn()
        
        // Record which side of the surface the incident ray came from
        // Note: The reflect() method works correctly regardless of whether the normal
        // points inward or outward from the surface (either being perpendicular to the surface).
        // However, when we alter the
        // reflected ray with scattering, we need to know the relationship between
        // the incident ray and the normal to determine if the scattered ray is
        // trying to go back through the surface from the wrong side.
        const incidentFromNegativeSide = incidentRay.getDirection().dot(surfaceNormal) < 0
        
        // Generate a random vector with magnitude equal to scatter * direction magnitude
        const scatterMagnitude = directionMagnitude * scatter
        const randomVector = this.generateRandomVector(scatterMagnitude)
        
        // Add the random vector to the original direction
        const newDirection = originalDirection.add(randomVector)
        
        // Check if the new direction is trying to go back through the surface
        // Use the same side as the incident ray to determine "inward"
        const scatteredFromNegativeSide = newDirection.dot(surfaceNormal) < 0
        if (scatteredFromNegativeSide === incidentFromNegativeSide) {
            // The scattered ray is trying to go back through the surface
            // Project it onto the surface plane to keep it on the correct side
            const projectedDirection = newDirection.subt(
                surfaceNormal.scalarMult(newDirection.dot(surfaceNormal))
            )
            
            return new Ray(reflectedRay.getOrigin(), projectedDirection.normalized().scalarMult(directionMagnitude), reflectedRay.color)
        }
        
        return new Ray(reflectedRay.getOrigin(), newDirection, reflectedRay.color)
    }
    
    static generateRandomVector(magnitude) {
        // Generate a random unit vector
        let randomVector
        do {
            const x = (Math.random() - 0.5) * 2
            const y = (Math.random() - 0.5) * 2
            const z = (Math.random() - 0.5) * 2
            randomVector = new Vector3D(x, y, z)
        } while (randomVector.magn() > 1)
        
        // Normalize and scale to desired magnitude
        return randomVector.normalized().scalarMult(magnitude)
    }
} 