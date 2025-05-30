import Vector3D from "../day20/vector3d.js";
import ReflectiveFacetedSolid from "./refl-faceted-solid.js";

class ReflectiveCube extends ReflectiveFacetedSolid {
    constructor(center,edgeLen,color) {
        const radius = Math.sqrt(3)/2*edgeLen
        const Z1 = 1/3*radius
        const Z2 = -1/3*radius
        const WD = Math.sqrt(8)/3*radius
        const TH2 = Math.PI/3
        const vList = []  // list of vertices
        vList.push(new Vector3D(0,0,radius))
        for (let i=1;i<=3;i++) {
            vList.push(new Vector3D(
                Math.cos((i-1)*2*TH2)*WD,
                Math.sin((i-1)*2*TH2)*WD,
                Z1))
        }
        for (let j=4;j<=6;j++) {
            vList.push(new Vector3D(
                Math.cos(((j-4)*2+1)*TH2)*WD,
                Math.sin(((j-4)*2+1)*TH2)*WD,
                Z2))
        }
        vList.push(new Vector3D(0,0,-radius))
        // fList = list of facets (squares), specified by
        // indices into the vList array
        const fList = [
            [0,1,4,2],
            [0,2,5,3],
            [0,3,6,1],
            [6,1,4,7],
            [5,3,6,7],
            [4,2,5,7]
        ]
        super(center,color,vList,fList)
    }
}

export default ReflectiveCube