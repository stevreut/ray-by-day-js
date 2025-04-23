import Vector3D from "./vector3d.js"
import Ray from "./ray.js"
import OpticalObject from "../day14/optical-object.js"

class OpticalEnvironment {
    constructor() {
        this.optObjList = []
        this.objCount = 0
        this.camera = null
    }
    SKY_BLUE = [135/255,206/255,235/255]
    addOpticalObject(obj) {
        if (!obj instanceof OpticalObject) {
            throw 'attempted to add non-OpticalObject'
        }
        this.optObjList.push(obj)
        this.objCount++
    }
    setCamera(cameraRay) {
        if (!cameraRay instanceof Ray) {
            throw 'attempted to setCamera for non-Ray'
        }
        this.camera = {}
        const org = cameraRay.getOrigin()
        let dir = cameraRay.getDirection()
        dir = dir.scalarMult(1/dir.magn())
        this.camera.orig = org
        this.camera.dir = dir
        const zVect = new Vector3D(0,0,1)
        let xUnit = this.camera.dir.cross(zVect)
        xUnit = xUnit.scalarMult(1/xUnit.magn())
        this.camera.xUnit = xUnit
        let yUnit = xUnit.cross(dir)
        yUnit = yUnit.scalarMult(1/yUnit.magn())
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
                return this.SKY_BLUE
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
            [1,1,1]  // white
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