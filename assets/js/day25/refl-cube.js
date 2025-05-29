import Vector3D from "../day20/vector3d.js";
import ReflectiveFacetedSolid from "./refl-faceted-solid.js";

class ReflectiveCube extends ReflectiveFacetedSolid {
    constructor(center,edgeLen,color) {
        const halfEdge = edgeLen/2
        const vList = []
        // Define the 8 vertices of the cube and add each to vList (list of 
        // vertices)
        const cList = [
            [-1, 1, 1],  // 0
            [ 1, 1, 1],  // 1
            [ 1,-1, 1],  // 2
            [-1,-1, 1],  // 3
            [-1, 1,-1],  // 4
            [ 1, 1,-1],  // 5
            [ 1,-1,-1],  // 6
            [-1,-1,-1]   // 7
        ]
        cList.forEach(trip=>{
            // For now (TODO), arbitrary rotation of 0.2 radians to give a more
            // interesting effect
            const theta = 0.2
            const x = (trip[0]*Math.cos(theta) - trip[1]*Math.sin(theta))*halfEdge
            const y = (trip[1]*Math.cos(theta) + trip[0]*Math.sin(theta))*halfEdge
            const z = trip[2]*halfEdge
            vList.push(new Vector3D(x,y,z))
        })
        // Create a list of facets, each containing a list of vertex numbers (the
        // indices into vList) which define the corners of a polygon
        const fList = []
        // Six faces for a cube
        fList.push([0,1,2,3])
        fList.push([0,1,5,4])
        fList.push([1,2,6,5])
        fList.push([2,3,7,6])
        fList.push([0,3,7,4])
        fList.push([4,5,6,7])
        // interceptDistance() and handle() rely entire on
        // the super class implementations
        super(center,color,vList,fList)
    }
}

export default ReflectiveCube