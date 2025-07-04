import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import OpticalObject from "../day20/optical-object.js"

class ConvexLens extends OpticalObject {
    constructor(center, radius, thickness, refractiveIndex = 1.8) {
        super()
        if (!(center instanceof Vector3D)) {
            throw 'center must be a Vector3D'
        }
        if (typeof radius !== 'number' || radius <= 0) {
            throw 'radius must be a positive number'
        }
        if (typeof thickness !== 'number' || thickness <= 0) {
            throw 'thickness must be a positive number'
        }
        if (typeof refractiveIndex !== 'number' || refractiveIndex <= 1) {
            throw 'refractiveIndex must be greater than 1'
        }
        
        this.center = center
        this.radius = radius
        this.thickness = thickness
        this.refractiveIndex = refractiveIndex
        
        // Calculate the center of the spherical surface
        // The planar surface is at center, the spherical surface is offset by thickness
        this.sphereCenter = center.add(new Vector3D(0, 0, thickness))
        
        // Calculate the radius of curvature of the spherical surface
        // For a convex lens, the spherical surface has positive curvature
        this.sphereRadius = radius * 2  // Make it reasonably curved
    }
    
    interceptDistance(ray) {
        // Check intersection with the planar surface first (closer to camera)
        const planarDist = this.interceptPlanarSurface(ray)
        if (planarDist !== null && planarDist > 0) {
            return planarDist
        }
        
        // Check intersection with the spherical surface
        const sphereDist = this.interceptSphericalSurface(ray)
        if (sphereDist !== null && sphereDist > 0) {
            return sphereDist
        }
        
        return null
    }
    
    interceptPlanarSurface(ray) {
        // Planar surface is perpendicular to Z-axis at the lens center
        const rayDir = ray.getDirection()
        const rayOrigin = ray.getOrigin()
        
        // Check if ray is moving toward the plane (negative Z direction)
        if (rayDir.getZ() >= 0) {
            return null  // Ray is moving away from or parallel to plane
        }
        
        // Calculate intersection with the plane
        const planeZ = this.center.getZ()
        const t = (planeZ - rayOrigin.getZ()) / rayDir.getZ()
        
        if (t <= 0) {
            return null  // Intersection is behind the ray origin
        }
        
        // Check if intersection point is within the lens radius
        const intersectionPoint = rayOrigin.add(rayDir.scalarMult(t))
        const distanceFromCenter = intersectionPoint.subt(this.center).magn()
        
        if (distanceFromCenter <= this.radius) {
            return t
        }
        
        return null
    }
    
    interceptSphericalSurface(ray) {
        // Use the same logic as a sphere but with the offset center
        const C = this.sphereCenter.subt(ray.getOrigin())
        const D = ray.getDirection()
        const CD = C.dot(D)
        const det = CD**2 - D.magnSqr()*(C.magnSqr() - this.sphereRadius**2)
        
        if (det <= 0) {
            return null
        }
        
        const detRoot = Math.sqrt(det)
        let k = CD - detRoot
        if (k <= 0) {
            k = CD + detRoot
            if (k <= 0) {
                return null
            }
        }
        
        k /= D.magn()
        return k
    }
    
    handle(ray) {
        const dist = this.interceptDistance(ray)
        if (dist === null || dist <= 0) {
            return ray.color
        }
        
        const rayDir = ray.getDirection()
        const intersectionPoint = ray.getOrigin().add(rayDir.scalarMult(dist))
        
        // Determine which surface was hit
        const distanceFromCenter = intersectionPoint.subt(this.center).magn()
        const isPlanarSurface = Math.abs(intersectionPoint.getZ() - this.center.getZ()) < 0.001
        
        if (isPlanarSurface) {
            // Handle planar surface (entering the lens)
            return this.handlePlanarSurface(ray, intersectionPoint)
        } else {
            // Handle spherical surface (exiting the lens)
            return this.handleSphericalSurface(ray, intersectionPoint)
        }
    }
    
    handlePlanarSurface(ray, intersectionPoint) {
        // Planar surface normal is always (0, 0, 1) in camera coordinates
        const normal = new Vector3D(0, 0, 1)
        const incidentDir = ray.getDirection()
        
        // Refract into the lens material
        const refractedDir = incidentDir.refract(normal, this.refractiveIndex)
        
        // Create new ray continuing through the lens
        const newRay = new Ray(intersectionPoint, refractedDir, ray.color)
        return newRay
    }
    
    handleSphericalSurface(ray, intersectionPoint) {
        // Calculate normal vector pointing outward from sphere center
        const normal = intersectionPoint.subt(this.sphereCenter).normalized()
        const incidentDir = ray.getDirection()
        
        // Refract out of the lens material (from lens to air, so 1/refractiveIndex)
        const refractedDir = incidentDir.refract(normal, 1/this.refractiveIndex)
        
        // Create new ray exiting the lens
        const newRay = new Ray(intersectionPoint, refractedDir, ray.color)
        return newRay
    }
}

export default ConvexLens 