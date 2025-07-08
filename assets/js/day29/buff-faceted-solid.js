import Vector3D from "../day20/vector3d.js"
import Color from "../day20/color.js"
import OpticalObjectGroup from "../day25/optobj-group.js"
import BuffTriangle from "./buff-tri.js"
import Matrix3D from "../day26/matrix3d.js"

class BuffFacetedSolid extends OpticalObjectGroup {
    constructor (center, color, relativeVertexList, facetList, scatter = 0, transformationMatrix) {
        // Validate scatter parameter
        if (scatter < 0) {
            throw new Error('Scatter parameter must be non-negative')
        }
        if (scatter > 0.99) {
            scatter = 0.99
        }
        
        if (transformationMatrix) {
            if (!(transformationMatrix instanceof Matrix3D)) {
                throw 'transformationMatrix is not an instance of Matrix3D'
            }
            relativeVertexList = relativeVertexList.map(vertex=>transformationMatrix.vectorMult(vertex))
        }
        
        if (!(center instanceof Vector3D)) {
            throw 'center is not a Vector3D object'
        }
        if (!(color instanceof Color)) {
            throw 'invalid color (1)'
        }
        if (!Array.isArray(relativeVertexList)) {
            throw 'relativeVertexList is not an array'
        }
        if (relativeVertexList.length < 4) {
            throw 'too few vertices for faceted solid (at least 4 expected)'
        }
        
        let maxMagn = 0
        let vertexList = []
        relativeVertexList.forEach(relVertex=>{
            if (!(relVertex instanceof Vector3D)) {
                throw 'vertex is not a Vector3D object'
            }
            maxMagn = Math.max(maxMagn,relVertex.magn())
            vertexList.push(center.add(relVertex))
        })
        
        if (maxMagn <= 0) {
            throw 'zero radius not allowed'
        }
        let localRadius = maxMagn
        
        if (!Array.isArray(facetList)) {
            throw 'facetList is not an array'
        }
        
        let triangleList = []
        facetList.forEach(facet=>{
            if (!Array.isArray(facet)) {
                throw 'facet within facetList is not an array'
            }
            if (facet.length < 3) {
                throw 'facet does not have at least three vertices'
            }
            facet.forEach(facetVertex=>{
                if (typeof facetVertex !== 'number' || !Number.isInteger(facetVertex)) {
                    throw 'non-integer facet vertex in facetList'
                }
                if (facetVertex < 0 || facetVertex >= vertexList.length) {
                    throw 'facet vertex out of range for number of vertices'
                }
            })
            for (let triNum=0;triNum<facet.length-2;triNum++) {
                const corner1 = vertexList[facet[0]]
                const corner2 = vertexList[facet[triNum+1]]
                const corner3 = vertexList[facet[triNum+2]]
                const triangle = new BuffTriangle(corner1, corner2, corner3, color, scatter)
                triangleList.push(triangle)
            }
        })
        
        super(center, localRadius, triangleList)
        
        // Store scatter attributes
        this.scatter = scatter
        this.usingScatter = scatter !== 0
    }
}

export default BuffFacetedSolid 