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
}

export default OpticalEnvironment