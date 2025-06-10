import Vector3D from "../day20/vector3d.js";
import ReflectiveFacetedSolid from "./refl-faceted-solid.js";

class ReflectiveCube extends ReflectiveFacetedSolid {
    constructor(center,radius,color,transformationMatrix) {
        const WD = Math.sqrt(4/3)*radius
        const corners = [
            [0,0,0],
            [0,0,1],
            [0,1,0],
            [0,1,1],
            [1,0,0],
            [1,0,1],
            [1,1,0],
            [1,1,1]
        ]
        const vList = []  // list of vertices
        corners.forEach(corner=>{
            const centeredAndSizedCorner = corner.map(coord=>(coord-0.5)*WD)
            vList.push(new Vector3D(centeredAndSizedCorner))
        })
        vList.push(new Vector3D(0,0,-radius))
        // fList = list of facets (squares), specified by
        // indices into the vList array
        const fList = [
            [0,1,3,2],
            [0,1,5,4],
            [1,3,7,5],
            [3,2,6,7],
            [2,0,6,4],
            [4,5,7,6]
        ]
        super(center,color,vList,fList,transformationMatrix)
    }
}

export default ReflectiveCube