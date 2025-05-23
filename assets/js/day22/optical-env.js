import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import OpticalObject from "../day20/optical-object.js"

class OpticalEnvironment {
    ASPECT_FACTOR = 4
    constructor() {
        this.optObjList = []
        this.objCount = 0
        this.camera = null
    }
    SKY_BLUE = [0.53125,0.8125,0.90625]
    WHITE = [1,1,1]
    MAX_ITERATIONS = 11
    addOpticalObject(obj) {
        if (!obj instanceof OpticalObject) {
            throw 'attempted to add non-OpticalObject'
        }
        this.optObjList.push(obj)
        this.objCount++
    }
    setCamera(cameraRay,aperture=0,focalDistance=4) {
        if (!cameraRay instanceof Ray) {
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
    }
    getObjectCount() {
        return this.objCount
    }
    colorFromXY(x,y) {
        let ray = this.rayFromXY(x,y)
        if (!ray.count) {
            ray.count = 1
        }
        let color = this.colorFromRay(ray)
        return color
    }
    colorFromRay(ray) {
        if (ray.count >= this.MAX_ITERATIONS) {
            // To prevent infinite recursion
            return ray.color
        }
        let { leastDist, leastDistObj } = this.getLeastDistanceObject(ray)
        if (leastDist === null) {
            return this.SKY_BLUE.map((prim,idx)=>prim*ray.color[idx])
        }
        let result = leastDistObj.handle(ray)
        let rayArray = []
        if (result instanceof Ray) {
            rayArray.push(result)
        } else if (Array.isArray(result)) {
            if (this.isColor(result)) {
                return result  // color - expected return type of this method
            } else if (this.isRayArray(result)) {
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
        let sumColor = [0,0,0]
        rayArray.forEach(subRay=>{
            subRay.count = ray.count+1  // IMPORTANT!
            const subColor = this.colorFromRay(subRay)  // NOTE: RECURSIVE!!
            for (let i=0;i<3;i++) {
                sumColor[i] += subColor[i]
            }
        })
        return sumColor
    }
    isColor(arr) {
        if (!Array.isArray(arr) ||
            arr.length !== 3) {
                return false
        }
        arr.forEach(itm=>{
            if (typeof itm !== 'number') {
                return false
            }
        })
        return true
    }
    isRayArray(arr) {
        if (!Array.isArray(arr) || 
            arr.length < 1) {
                return false
        }
        arr.forEach(itm=>{
            if (! itm instanceof Ray) {
                return false
            }
        })
        return true
    }
    rayFromXY(x,y) {
        let origVector = this.camera.orig
        let dirVector = this.camera.xUnit.scalarMult(x)
            .add(this.camera.yUnit.scalarMult(y))
            .add(this.camera.dir.scalarMult(this.ASPECT_FACTOR))
        if (this.camera.usingAperture) {
            const [randX,randY] = randomWithinUnitCircle()
            const randomBlurVector = this.camera.xUnit.scalarMult(this.camera.semiAperture*randX)
                .add(this.camera.yUnit.scalarMult(this.camera.semiAperture*randY))
            origVector = origVector.add(randomBlurVector)
            dirVector = dirVector.add(randomBlurVector.scalarMult(this.camera.directionApertureMultiplier))
        }
        return new Ray(origVector,
            dirVector,
            this.WHITE
        )
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
        this.optObjList.forEach(obj=>{
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
}

export default OpticalEnvironment