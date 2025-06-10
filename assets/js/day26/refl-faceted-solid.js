import Vector3D from "../day20/vector3d.js"
import Color from "../day20/color.js"
import OpticalObjectGroup from "../day25/optobj-group.js"
import ReflectiveTriangle from "../day23/reflective-triangle.js"
import Matrix3D from "./matrix3d.js"

class ReflectiveFacetedSolid extends OpticalObjectGroup {
    constructor (center,color,relativeVertexList,facetList,transformationMatrix) {
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
        if (transformationMatrix) {
            if (!(transformationMatrix instanceof Matrix3D)) {
                throw 'transformationMatrix is not an instance of Matrix3D'
            }
            relativeVertexList = relativeVertexList.map(vertex=>transformationMatrix.vectorMult(vertex))
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
                const triangle = new ReflectiveTriangle(corner1, corner2, corner3, color)
                triangleList.push(triangle)
            }
        })
        super(center,localRadius,triangleList)
    }
}

export default ReflectiveFacetedSolid