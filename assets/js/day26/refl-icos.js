import Vector3D from "../day20/vector3d.js";

import ReflectiveFacetedSolid from "./refl-faceted-solid.js"

class ReflectiveIcosahedron extends ReflectiveFacetedSolid {
    constructor(center,radius,color,transformationMatrix) {
        const TH1 = Math.atan(2)
        const TH2 = Math.PI/5
        const Z1 = Math.cos(TH1)
        const L1 = Math.sin(TH1)
        const vList = []
        vList.push(new Vector3D(0,0,radius))
        for (let i=1;i<=5;i++) {
            vList.push(new Vector3D(
                L1*radius*Math.cos((i-1)*TH2*2),
                L1*radius*Math.sin((i-1)*TH2*2),
                Z1*radius
            ))
        }
        for (let j=6;j<=10;j++) {
            vList.push(new Vector3D(
                L1*radius*Math.cos(((j-6)*2+1)*TH2),
                L1*radius*Math.sin(((j-6)*2+1)*TH2),
                -Z1*radius
            ))
        }
        vList.push(new Vector3D(0,0,-radius))
        const fList = [
            [0,1,2],
            [0,2,3],
            [0,3,4],
            [0,4,5],
            [0,5,1],
            [1,2,6],
            [2,3,7],
            [3,4,8],
            [4,5,9],
            [5,1,10],
            [1,10,6],
            [2,6,7],
            [3,7,8],
            [4,8,9],
            [5,9,10],
            [6,7,11],
            [7,8,11],
            [8,9,11],
            [9,10,11],
            [10,6,11]
        ]
        super(center,color,vList,fList,transformationMatrix)
    }
}

export default ReflectiveIcosahedron

