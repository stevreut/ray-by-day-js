import Vector3D from "../day20/vector3d.js";

import ReflectiveFacetedSolid from "../day26/refl-faceted-solid.js"

class ReflectiveTetrahedron extends ReflectiveFacetedSolid {
    constructor(center,radius,color,transformationMatrix) {
        const TH = 2*Math.PI/3
        const Z1 = -1/3
        const L1 = Math.sqrt(8)/3
        const vList = []
        vList.push(new Vector3D(0,0,radius))
        for (let i=1;i<=3;i++) {
            vList.push(new Vector3D(
                L1*radius*Math.cos((i-1)*TH*2),
                L1*radius*Math.sin((i-1)*TH*2),
                Z1*radius
            ))
        }
        const fList = [
            [0,1,2],
            [0,2,3],
            [0,3,1],
            [1,2,3]
        ]
        super(center,color,vList,fList,transformationMatrix)
    }
}

export default ReflectiveTetrahedron

