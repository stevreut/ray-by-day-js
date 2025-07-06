import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import OpticalObject from "../day20/optical-object.js"

class ConcaveLens extends OpticalObject {
    constructor(distance, radius, thickness, sphereRadius, indexOfRefraction = 1.5) {
        super()
        if (typeof distance !== 'number' || distance <= 0) {
            throw 'distance must be a positive number'
        }
        if (typeof radius !== 'number' || radius <= 0) {
            throw 'radius must be a positive number'
        }
        if (typeof thickness !== 'number' || thickness <= 0) {
            throw 'thickness must be a positive number'
        }
        if (typeof sphereRadius !== 'number' || sphereRadius <= 0) {
            throw 'sphereRadius must be a positive number'
        }
        if (typeof indexOfRefraction !== 'number' || indexOfRefraction <= 1) {
            throw 'indexOfRefraction must be greater than 1'
        }
        if (sphereRadius < 2 * radius) {
            throw 'sphereRadius must be at least 2 * radius for concave lens'
        }
        if (thickness >= 2 * radius) {
            throw 'thickness must be < 2*radius for concave lens'
        }
        if (thickness >= distance) {
            throw 'thickness must be < distance'
        }
        
        this.distance = distance
        this.lensRadius = radius
        this.lensRadiusSquared = radius * radius
        this.thickness = thickness
        this.sphereRadius = sphereRadius
        this.sphereRadiusSquared = sphereRadius * sphereRadius
        this.indexOfRefraction = indexOfRefraction
        
        // Calculate half thickness for convenience
        this.halfThickness = thickness / 2
        
        // Calculate sphere centers for concave lens
        // For a concave lens, the sphere centers are positioned to create a diverging lens
        // The front sphere center is behind the lens center, the back sphere center is in front
        const separationDistance = 2 * this.sphereRadius + thickness
        const halfSeparation = separationDistance / 2

        // Front sphere center (behind lens center)
        this.frontSphereCenter = new Vector3D(0, 0, -distance + halfSeparation)
        
        // Back sphere center (in front of lens center)
        this.backSphereCenter = new Vector3D(0, 0, -distance - halfSeparation)
    }
    
    interceptDistance(ray) {
        // Check intersection with the front sphere (closer to camera)
        return this.interceptSphere(ray, this.frontSphereCenter, this.sphereRadius)
    }
    
    interceptSphere(ray, sphereCenter) {
        // Standard sphere-ray intersection
        const C = sphereCenter.subt(ray.getOrigin())
        const D = ray.getDirection().normalized()
        const CD = C.dot(D)
        const det = CD**2 - D.magnSqr()*(C.magnSqr() - this.sphereRadiusSquared)
        
        if (det <= 0) {
            return null
        }
        
        const detRoot = Math.sqrt(det)
        const k1 = CD - detRoot
        
        // Choose the appropriate intersection based on ray origin
        let k = null
        if (k1 > 0) {
            k = k1  // Use closer intersection if ray starts outside
        } else {
            const k2 = CD + detRoot
            if (k2 > 0) 
            k = k2  // Use farther intersection if ray starts inside
        }
        
        if (k === null) {
            return null
        }
        
        // Check if intersection point is within lens aperture (lensRadius)
        const intersectionPoint = ray.getOrigin().add(D.scalarMult(k))
        
        // Lens center is at (0, 0, -distance)
        const lensCenter = new Vector3D(0, 0, -this.distance)
        const offsetFromLensCenter = intersectionPoint.subt(lensCenter)
        const xOffset = offsetFromLensCenter.getX()
        const yOffset = offsetFromLensCenter.getY()
        const distanceFromAxisSquared = xOffset*xOffset + yOffset*yOffset
        
        if (distanceFromAxisSquared <= this.lensRadiusSquared) {
            return k
        }
        
        return null
    }
    
    handle(ray, distance) {
        if (distance === null || distance <= 0) {
            return ray.color
        }
        
        // Calculate intersection point with front sphere
        const rayDir = ray.getDirection().normalized()
        const frontIntersectionPoint = ray.getOrigin().add(rayDir.scalarMult(distance))
        
        // Calculate normal vector pointing inward toward front sphere center (concave surface)
        const frontNormal = this.frontSphereCenter.subt(frontIntersectionPoint).normalized()
        const incidentDir = ray.getDirection()
        
        // Refract from air to glass using Vector3D.refract method
        const refractedDir = incidentDir.refract(frontNormal, this.indexOfRefraction)
        
        // Create ray inside the lens
        const internalRay = new Ray(frontIntersectionPoint, refractedDir, ray.color)
        
        // Find intersection with back sphere
        const backDistance = this.interceptSphere(internalRay, this.backSphereCenter, this.sphereRadius)
        
        if (backDistance === null || backDistance <= 0) {
            // If the internal ray doesn't intersect the second sphere, 
            // return the original incident ray unaltered
            return ray
        }
        
        // Calculate intersection point with back sphere
        const backIntersectionPoint = internalRay.getOrigin().add(refractedDir.normalized().scalarMult(backDistance))
        
        // Calculate normal vector pointing inward toward back sphere center (concave surface)
        const backNormal = this.backSphereCenter.subt(backIntersectionPoint).normalized()
        
        // Refract from glass to air using Vector3D.refract method
        const finalRefractedDir = refractedDir.refract(backNormal, 1/this.indexOfRefraction)
        
        // Temporarily alter color based on distance traversed through lens material
        const distanceTraversed = backDistance
        const alteredColor = ray.color.filter(new Color(0.9,0.95,0.9).overDistance(distanceTraversed))
        
        // Create final ray exiting the lens
        const finalRay = new Ray(backIntersectionPoint, finalRefractedDir, alteredColor)
        return finalRay
    }
    

}

export default ConcaveLens 