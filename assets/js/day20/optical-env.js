import Vector3D from "./vector3d.js"
import Ray from "./ray.js"
import Color from "./color.js"
import OpticalObject from "./optical-object.js"

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
        let done = false
        let count = 0
        while (!done) {
            let { leastDist, leastDistObj } = this.getLeastDistanceObject(ray)
            if (leastDist === null) {
                return ray.color.filter(OpticalEnvironment.SKY_BLUE)
            } else {
                count++
                if (count > 10) {
                    done = true
                }
                let result = leastDistObj.handle(ray)
                if (result instanceof Ray) {
                    if (done) {
                        return result.color
                    } else {
                        ray = result  // ... and redo
                    }
                } else {
                    return result
                }
            }
        }
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