import OpticalObject from "../day20/optical-object.js"
import OpticalEnvironment from "../day20/optical-env.js"  // TODO - might not need
import Color from "../day20/color.js"
import Sphere from "../day20/sphere.js"
import Vector3D from "../day20/vector3d.js"

class OpticalObjectGroup extends OpticalObject {
    constructor(center,radius,objList) {
        super()
        this.center = center  // TODO - validation, must be Vector3D
        this.radius = radius  // TODO - validation, must be positive number
        this.envelopeSphere = new Sphere(this.center, this.radius, new Color(), new Vector3D(0,0,1))  
        if (!Array.isArray(objList)) {
            throw 'objList is not an array'
        }
        this.env = new OpticalEnvironment()
        objList.forEach(obj=>{
            this.addComponentObject(obj)
        })
    }
    addComponentObject(obj) {
        if (!obj || !(obj instanceof OpticalObject)) {  // TODO - is the 1st of these 2 tests necessary?
            throw 'attempt to add other than OpticalObject'
        }
        this.env.addOpticalObject(obj)
    }
    interceptDistance(ray) {
        const sphDist = this.envelopeSphere.interceptDistance(ray)
        if (sphDist === null) {
            return null
        }
        const { leastDist } = this.env.getLeastDistanceObject(ray)
        return leastDist
    }
    handle (ray) {
        const { leastDist, leastDistObj } = this.env.getLeastDistanceObject(ray)  // TODO - figure out how to remove this redundancy
        if (leastDist === null || leastDistObj === null) {
            console.error ('unexpected null least dist obj on handle - continuing')
            return null
        }
        return leastDistObj.handle(ray)
    }

}

export default OpticalObjectGroup