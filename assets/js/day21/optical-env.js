import Vector3D from "../day20/vector3d.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"
import OpticalObject from "../day20/optical-object.js"

class OpticalEnvironment {
    constructor() {
        this.optObjList = []
        this.objCount = 0
        this.camera = null
    }
    static SKY_BLUE
    static WHITE
    static {
        OpticalEnvironment.SKY_BLUE = new Color([135/255,206/255,235/255])
        OpticalEnvironment.WHITE = new Color()
    }
    MAX_ITERATIONS = 11
    addOpticalObject(obj) {
        if (!(obj instanceof OpticalObject)) {
            throw 'attempted to add non-OpticalObject'
        }
        this.optObjList.push(obj)
        this.objCount++
    }
    setCamera(cameraRay) {
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
    }
    getObjectCount() {
        return this.objCount
    }
    colorFromXY(x,y) {
        let ray = this.rayFromXY(x,y)
        if (!ray.count) {
            ray.count = 1
        }
        // return this.colorFromRay(ray)
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
        rayArray.forEach(subRay=>{
            subRay.count = ray.count+1  // IMPORTANT!
            const subColor = this.colorFromRay(subRay)  // NOTE: RECURSIVE!!
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
        let dirVector = this.camera.xUnit.scalarMult(x)
            .add(this.camera.yUnit.scalarMult(y))
            .add(this.camera.dir.scalarMult(4))
        return new Ray(this.camera.orig,
            dirVector,
            OpticalEnvironment.WHITE
        )
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