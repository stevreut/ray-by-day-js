import OpticalObject from "../day20/optical-object.js";
import OpticalObjectGroup from "../day25/optobj-group.js";
import Vector3D from "../day20/vector3d.js";
import ReflectiveTetrahedron from "./refl-tetra.js";

class SierpinskiTetrahedron extends OpticalObject {
    constructor(center,radius,level,color) {
        if (!Number.isInteger(level) || level < 0 || level > 10) {
            throw 'invalid level parameter in new SierpinskiTetrahedron'
        }
        super()
        this.level = level
        this.isTetra = (level <= 0)
        if (this.isTetra) {
            this.tetrahedron = new ReflectiveTetrahedron(center,radius,color,null/*TODO*/)
        } else {
            const subLevel = level-1
            const subRadius = radius/2
            const objList = []
            // Note RECURSION in populating objList
            objList.push(new SierpinskiTetrahedron(center.add(new Vector3D(0,0,subRadius)),subRadius,subLevel,color))
            objList.push(new SierpinskiTetrahedron(center.add(new Vector3D(subRadius,0,0)),subRadius,subLevel,color))
            objList.push(new SierpinskiTetrahedron(center.add(new Vector3D(0,subRadius,0)),subRadius,subLevel,color))
            this.group = new OpticalObjectGroup(center,radius,objList)
        }
    }
    interceptDistance(ray) {
        if (this.isTetra) {
            return this.tetrahedron.interceptDistance(ray)
        } else {
            return this.group.interceptDistance(ray)
        }
    }
    handle(ray) {
        if (this.isTetra) {
            return this.tetrahedron.handle(ray)
        } else {
            return this.group.handle(ray)
        }
    }
}

export default SierpinskiTetrahedron

