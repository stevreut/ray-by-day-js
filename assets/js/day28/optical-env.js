import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import OpticalObject from "../day20/optical-object.js"
import Matrix3D from "./matrix3d.js"

class OpticalEnvironment {
    ASPECT_FACTOR = 4
    constructor() {
        this.optObjList = []
        this.lenseOrFilterList = [] // New list for lenses and filters
        this.camera = null
    }
    static SKY_BLUE
    static WHITE
    static {
        OpticalEnvironment.SKY_BLUE =
            new Color(0.53125,0.8125,0.90625)
        OpticalEnvironment.WHITE = new Color()
    }
    MAX_ITERATIONS = 11
    addOpticalObject(obj) {
        if (!(obj instanceof OpticalObject)) {
            throw 'attempted to add non-OpticalObject'
        }
        this.optObjList.push(obj)
    }
    
    addLenseOrFilter(obj) {
        if (!(obj instanceof OpticalObject)) {
            throw 'attempted to add non-OpticalObject to lenseOrFilterList'
        }
        this.lenseOrFilterList.push(obj)
    }
    removeOpticalObjectsByClassName(className) {
        // Remove all objects with the given class name from both lists
        this.optObjList = this.optObjList.filter(obj => obj.constructor.name !== className)
        this.lenseOrFilterList = this.lenseOrFilterList.filter(obj => obj.constructor.name !== className)
    }
    setCamera(cameraRay,aperture=0,focalDistance=4) {
        if (!(cameraRay instanceof Ray)) {
            throw 'attempted to setCamera for non-Ray'
        }
        this.camera = {}
        const org = cameraRay.getOrigin()
        let dir = cameraRay.getDirection().normalized()
        this.camera.orig = org
        this.camera.dir = dir
        const zVect = new Vector3D(0,0,1)
        const xUnit = this.camera.dir.cross(zVect).normalized()
        this.camera.xUnit = xUnit
        const yUnit = xUnit.cross(dir).normalized()
        this.camera.yUnit = yUnit
        this.camera.semiAperture = aperture/2
        this.camera.usingAperture = (this.camera.semiAperture !== 0)
        if (this.camera.usingAperture) {
            this.camera.distance = focalDistance
            this.camera.directionApertureMultiplier = -this.ASPECT_FACTOR/this.camera.distance
        }
        
        // Create coordinate transformation matrices
        // Camera coordinate system: -Z is camera direction, X and Y are screen axes
        this.camera.worldToCameraMatrix = new Matrix3D(
            [xUnit.getX(), xUnit.getY(), xUnit.getZ()],
            [yUnit.getX(), yUnit.getY(), yUnit.getZ()],
            [-dir.getX(), -dir.getY(), -dir.getZ()]
        )
        this.camera.cameraToWorldMatrix = this.camera.worldToCameraMatrix.inverse()
        }
    
    getObjectCount() {
        return this.optObjList.length
    }
 
    colorFromXY(x,y) {
        let ray = this.rayFromXY(x,y)
        if (!ray.count) {
            ray.count = 1
        }
        let color = this.colorFromRay(ray)
        if (!(color instanceof Color)) {
            console.error('non-color: ', color, ' coords = ', x, y)
        }
        return color
    }
    colorFromRay(ray) {
        if (ray.count >= this.MAX_ITERATIONS) {
            // To prevent infinite recursion
            return ray.color
        }
        
        // Phase 1: Process lenses and filters in camera coordinates
        let processedRay = ray
        if (this.lenseOrFilterList.length > 0) {
            // Ray is already in camera coordinates, process lenses/filters directly
            let cameraRay = ray
            
            for (let lensOrFilter of this.lenseOrFilterList) {
                const dist = lensOrFilter.interceptDistance(cameraRay)
                if (dist !== null && dist > 0) {
                    const result = lensOrFilter.handle(cameraRay, dist)
                    if (result instanceof Ray) {
                        cameraRay = result
                    } else if (result instanceof Color) {
                        return result  // Lens/filter returned a color, we're done
                    } else if (Array.isArray(result)) {
                        if (this.isRayArray(result)) {
                            // Take the first ray from the array for sequential processing
                            cameraRay = result[0]
                        } else {
                            console.error('invalid return result ', result, ' ', typeof result)
                            throw 'invalid handle result - neither Ray nor expected Array type'
                        }
                    } else {
                        console.error('bad result type = ', typeof result, ' result = ', result)
                        throw 'unexpected result type - neither array nor Ray'
                    }
                }
            }
            
            // Transform processed ray to world coordinates for Phase 2
            processedRay = this.transformRayToWorldCoordinates(cameraRay)
        }
        
        // Phase 2: Process regular objects in world coordinates
        return this.processRegularObjects(processedRay)
    }
    
    processRegularObjects(ray) {
        if (ray.count >= this.MAX_ITERATIONS) {
            // To prevent infinite recursion
            return ray.color
        }
        
        let { leastDist, leastDistObj } = this.getLeastDistanceObject(ray)
        if (leastDist === null) {
            return ray.color.filter(OpticalEnvironment.SKY_BLUE)
        }
        
        let result = leastDistObj.handle(ray)
        let rayArray = []
        if (result instanceof Ray) {
            rayArray.push(result)
        } else if (result instanceof Color) {
            return result  // color - expected return type of this method
        } else if (Array.isArray(result)) {
            if (this.isRayArray(result)) {
                rayArray = result
            } else {
                console.error('invalid return result ', result, ' ', typeof result)
                throw 'invalid handle result - neither Ray nor expected Array type'
            }
            if (!Array.isArray(rayArray) || rayArray.length < 1) {
                console.error('rayArray = ', rayArray, typeof rayArray)
                throw 'unexpected rayArray type'
            }
        } else {
            console.error('bad result type = ', typeof result, ' result = ', result)
            throw 'unexpected result type - neither array nor Ray'
        }
        
        let colorStack = []
        rayArray.forEach(subRay => {
            subRay.count = ray.count + 1  // IMPORTANT!
            const subColor = this.processRegularObjects(subRay)  // NOTE: RECURSIVE - but only Phase 2!
            colorStack.push(subColor)
        })
        return Color.sum(colorStack)
    }
    isRayArray(arr) {
        if (!Array.isArray(arr) || 
            arr.length < 1) {
                return false
        }
        arr.forEach(itm=>{
            if (!(itm instanceof Ray)) {
                return false
            }
        })
        return true
    }
    rayFromXY(x,y) {
        // Generate ray in camera coordinates: origin at (0,0,0), direction toward (x,y,-ASPECT_FACTOR)
        let cameraOrigin = new Vector3D(0, 0, 0)
        let cameraDirection = new Vector3D(x, y, -this.ASPECT_FACTOR)
        
        if (this.camera.usingAperture) {
            const [randX,randY] = randomWithinUnitCircle()
            // Add aperture blur in camera coordinates
            cameraOrigin = cameraOrigin.add(new Vector3D(randX * this.camera.semiAperture, randY * this.camera.semiAperture, 0))
            cameraDirection = cameraDirection.add(new Vector3D(randX * this.camera.semiAperture * this.camera.directionApertureMultiplier, 
                                                              randY * this.camera.semiAperture * this.camera.directionApertureMultiplier, 0))
        }
        
        return new Ray(cameraOrigin, cameraDirection, OpticalEnvironment.WHITE)
        //
        function randomWithinUnitCircle() {
            while (true) {
                const x = Math.random()*2-1
                const y = Math.random()*2-1
                if (x*x+y*y <= 1) {
                    return [x,y]
                }
            }
        }
    }
    getLeastDistanceObject(ray) {
        let leastDist = null
        let leastDistObj = null
        
        // Only check regular objects (lenses/filters are handled separately)
        this.optObjList.forEach(obj => {
            let dist = obj.interceptDistance(ray)
            if (dist !== null && (leastDist === null || dist < leastDist)) {
                leastDist = dist
                leastDistObj = obj
            }
        })
        
        return {
            leastDist,
            leastDistObj
        }
    }
    
    // Currently unused - kept for future use or debugging
    // transformRayToCameraCoordinates(worldRay) {
    //     // Transform ray origin and direction to camera coordinates
    //     // First subtract camera origin, then apply rotation matrix
    //     const relativeOrigin = worldRay.getOrigin().subt(this.camera.orig)
    //     const cameraOrigin = this.camera.worldToCameraMatrix.vectorMult(relativeOrigin)
    //     const cameraDirection = this.camera.worldToCameraMatrix.vectorMult(worldRay.getDirection())
    //     return new Ray(cameraOrigin, cameraDirection, worldRay.color)
    // }
    
    transformRayToWorldCoordinates(cameraRay) {
        // Transform ray origin and direction back to world coordinates
        // First apply rotation matrix, then add camera origin
        const worldOrigin = this.camera.cameraToWorldMatrix.vectorMult(cameraRay.getOrigin())
            .add(this.camera.orig)
        const worldDirection = this.camera.cameraToWorldMatrix.vectorMult(cameraRay.getDirection())
        return new Ray(worldOrigin, worldDirection, cameraRay.color)
    }
}

export default OpticalEnvironment