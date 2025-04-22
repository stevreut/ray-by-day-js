import Vector3D from "../day12/vector3d.js"
import Ray from "../day13/ray.js"
import OpticalObject from "../day14/optical-object.js"

class OpticalEnvironment {
    constructor() {
        this.optObjList = []
        this.objCount = 0
        this.camera = null
    }
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
        console.log('cameraRay at setCamera() = ' + cameraRay)  // TODO
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
        console.log('camera with embedded units after inclusion = ', this.camera.xUnit.toString(), ', ', this.camera.yUnit.toString(), ', ', this.camera.dir.toString())
    }
    getObjectCount() {
        return this.objCount
    }
    colorFromXY(x,y) {
        let ray = this.rayFromXY(x,y)
        let { leastDist, leastDistObj } = this.getLeastDistanceObject(ray)
        if (leastDist === null) {
            return [1,0,0]  // TODO
        } else {
            return leastDistObj.handle(ray)
        }
        // TODO
        if (x*x+y*y<1) {
            return [1,0,0]
        } else {
            return [0,0.5,0.5]
        }
    }
    rayFromXY(x,y) {
        return new Ray(this.camera.orig,
            new Vector3D(x,1,y),  // TODO - calculate based on xUnit, yUnit, etc.
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
        // return {
        //     leastDist: leastDist,
        //     leastDistObj: leastDistObj
        // }
        return {
            leastDist,
            leastDistObj
        }
    }
}

export default OpticalEnvironment