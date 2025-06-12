import OpticalObject from "../day20/optical-object.js";
import OpticalObjectGroup from "../day25/optobj-group.js";
import Vector3D from "../day20/vector3d.js";
import ReflectiveTetrahedron from "./refl-tetra.js";

class SierpinskiTetrahedron extends OpticalObject {
    static DIHEDRAL_ANGLE = Math.acos(-1/3)
    static FOUR_CORNERS = []
    static {
        this.FOUR_CORNERS = [
            new Vector3D(0,0,1),
            new Vector3D(
                Math.sin(this.DIHEDRAL_ANGLE),0,Math.cos(this.DIHEDRAL_ANGLE)),
            new Vector3D(
                Math.sin(this.DIHEDRAL_ANGLE)*Math.cos(Math.PI*2/3),
                Math.sin(this.DIHEDRAL_ANGLE)*Math.sin(Math.PI*2/3),
                Math.cos(this.DIHEDRAL_ANGLE)
            ),
            new Vector3D(
                Math.sin(this.DIHEDRAL_ANGLE)*Math.cos(Math.PI*2/3),
                Math.sin(this.DIHEDRAL_ANGLE)*Math.sin(Math.PI*4/3),
                Math.cos(this.DIHEDRAL_ANGLE)
            )
        ]
    }
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
            SierpinskiTetrahedron.FOUR_CORNERS.forEach(corner=>{
                objList.push(new SierpinskiTetrahedron(center.add(corner.scalarMult(subRadius)),subRadius,subLevel,color))
            })
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

