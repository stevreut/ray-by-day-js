import OpticalObject from "../day20/optical-object.js";
import OpticalObjectGroup from "../day25/optobj-group.js";
import Vector3D from "../day20/vector3d.js";
import ReflectiveTetrahedron from "./refl-tetra.js";
import ReflectiveSphere from "../day20/reflective-sphere.js";
import RefractiveSphere from "../day22/refractive-sphere.js";

class SierpinskiTetrahedron extends OpticalObject {
    static DIHEDRAL_ANGLE = Math.acos(-1/3)
    static THIRD_PART_ANGLE = Math.PI*2/3
    static FOUR_CORNERS = []
    static {
        this.FOUR_CORNERS = [
            new Vector3D(0,0,1),
            new Vector3D(
                Math.sin(this.DIHEDRAL_ANGLE),0,Math.cos(this.DIHEDRAL_ANGLE)),
            new Vector3D(
                Math.sin(this.DIHEDRAL_ANGLE)*Math.cos(this.THIRD_PART_ANGLE),
                Math.sin(this.DIHEDRAL_ANGLE)*Math.sin(this.THIRD_PART_ANGLE),
                Math.cos(this.DIHEDRAL_ANGLE)
            ),
            new Vector3D(
                Math.sin(this.DIHEDRAL_ANGLE)*Math.cos(this.THIRD_PART_ANGLE),
                Math.sin(this.DIHEDRAL_ANGLE)*Math.sin(this.THIRD_PART_ANGLE*2),
                Math.cos(this.DIHEDRAL_ANGLE)
            )
        ]
    }
    constructor(center,radius,level,color,option,mirroredColor,transparentColor) {
        if (!Number.isInteger(level) || level < 0 || level > 10) {
            throw 'invalid level parameter in new SierpinskiTetrahedron'
        }
        super()
        this.level = level
        this.option = option
        this.mirroredColor = mirroredColor
        this.transparentColor = transparentColor
        if (level <= 0) {
            this.innerObject = new ReflectiveTetrahedron(center,radius,color,null/*TODO*/)
        } else {
            const subLevel = level-1
            const subRadius = radius/2
            const objList = []
            SierpinskiTetrahedron.FOUR_CORNERS.forEach(corner=>{
                // Note RECURSION in populating objList
                objList.push(new SierpinskiTetrahedron(center.add(corner.scalarMult(subRadius)),
                    subRadius,subLevel,color,this.option,this.mirroredColor,this.transparentColor))
            })
            if (option === 'sphm' || (option === 'both' && level%2 === 0)) {
                objList.push(new ReflectiveSphere(center,subRadius*0.57,this.mirroredColor))
            } else if (option == 'spht' || (option === 'both' && level%2 !== 0)) {
                objList.push(new RefractiveSphere(center,subRadius*0.57,this.transparentColor,1.5))
            } // else just ignore
            this.innerObject = new OpticalObjectGroup(center,radius,objList)
        }
    }
    interceptDistance(ray) {
        return this.innerObject.interceptDistance(ray)
    }
    handle(ray) {
        return this.innerObject.handle(ray)
    }
}

export default SierpinskiTetrahedron

