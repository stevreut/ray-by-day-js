import Vector3D from "../day20/vector3d.js";

import BuffFacetedSolid from "./buff-faceted-solid.js"

class BuffDodecahedron extends BuffFacetedSolid {
    constructor(center,radius,color,scatter=0,transformationMatrix) {
        const K = Math.PI/180
        const A = 36*K
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
        // Alternatively, a, b, and c can be calculated as:
        // a = Math.atan(1.5-Math.sqrt(1.25))
        // b = Math.atan(Math.sqrt(1.25)-0.5)
        // c = Math.atan(3-Math.sqrt(5))
        // This latter approach is the simplification of the various
        // trigonometric operations above.  The result is simpler to
        // specify and to calculate, but is less intuitive.
        const zLevel = []
        zLevel.push(Math.cos(c)*radius)
        zLevel.push(Math.cos(c+2*a)*radius)
        zLevel.push(-zLevel[1])
        zLevel.push(-zLevel[0])
        const TH1 = Math.PI/5
        const vList = []
        const L0 = Math.sin(c)*radius
        for (let i=0;i<5;i++) {
            const angle = i*2*TH1
            vList.push(new Vector3D(Math.cos(angle)*L0,Math.sin(angle)*L0,zLevel[0]))
        }
        const L1 = Math.sin(c+2*a)*radius
        for (let j=5;j<10;j++) {
            const angle = (j-5)*2*TH1
            vList.push(new Vector3D(Math.cos(angle)*L1,Math.sin(angle)*L1,zLevel[1]))
        }
        const L2 = L1
        for (let k=10;k<15;k++) {
            const angle = ((k-10)*2+1)*TH1
            vList.push(new Vector3D(Math.cos(angle)*L2,Math.sin(angle)*L2,zLevel[2]))
        }
        const L3 = L0
        for (let m=15;m<20;m++) {
            const angle = ((m-15)*2+1)*TH1
            vList.push(new Vector3D(Math.cos(angle)*L3,Math.sin(angle)*L3,zLevel[3]))
        }
        const fList = [
            [0,1,2,3,4],
            //
            [0,1,6,10,5],
            [1,2,7,11,6],
            [2,3,8,12,7],
            [3,4,9,13,8],
            [4,0,5,14,9],
            //
            [6,11,16,15,10],
            [7,12,17,16,11],
            [8,13,18,17,12],
            [9,14,19,18,13],
            [5,10,15,19,14],
            //
            [15,16,17,18,19]

        ]
        super(center,color,vList,fList,scatter,transformationMatrix)
    }
}

export default BuffDodecahedron 