import Vector3D from "../day20/vector3d.js";

import ReflectiveFacetedSolid from "./refl-faceted-solid.js"

class ReflectiveOctahedron extends ReflectiveFacetedSolid {
    constructor(center,radius,color) {
        const K = Math.PI/180
        const A = 45*K
        const B = 60*K
        const C = 90*K
        const cosA = Math.cos(A)
        const cosB = Math.cos(B)
        const cosC = Math.cos(C)
        const sinA = Math.sin(A)
        const sinB = Math.sin(B)
        const sinC = Math.sin(C)
        const a = Math.acos((cosA+cosB*cosC)/(sinB*sinC))
        const b = Math.acos((cosB+cosA*cosC)/(sinA*sinC))
        const c = Math.acos((cosC+cosA*cosB)/(sinA*sinB))
        const zLevel = []
        zLevel.push(Math.cos(c)*radius)
        zLevel.push(-zLevel[0])
        const TH1 = Math.PI/3
        const vList = []
        const L0 = Math.sin(c)*radius
        for (let i=0;i<3;i++) {
            const angle = i*2*TH1
            vList.push(new Vector3D(Math.cos(angle)*L0,Math.sin(angle)*L0,zLevel[0]))
        }
        const L1 = Math.sin(c)*radius
        for (let j=3;j<6;j++) {
            const angle = ((j-3)*2+1)*TH1
            vList.push(new Vector3D(Math.cos(angle)*L1,Math.sin(angle)*L1,zLevel[1]))
        }
        const fList = [
            [0,1,2],
            //
            [0,1,3],
            [1,2,4],
            [2,0,5],
            //
            [0,5,3],
            [1,3,4],
            [2,4,5],
            //
            [3,4,5]
        ]
        super(center,color,vList,fList)
    }
}

export default ReflectiveOctahedron