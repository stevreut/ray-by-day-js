import OpticalObject from "../day19/optical-object.js";
import Vector3D from "../day19/vector3d.js";

class Triangle extends OpticalObject {
    constructor (vertex1, vertex2, vertex3) {
        super()
        this.verts = [vertex1,vertex2,vertex3]
        if (this.verts.length !== 3) {
            throw 'invalid argument count'
        }
        let isValid = true
        this.verts.forEach(vert=>{
            if (!vert instanceof Vector3D) {
                isValid = false
            }
        })
        if (!isValid) {
            throw 'invalid vertex type'
        }
        this.sideLeg1 = vertex2.subt(vertex1)
        this.sideLeg2 = vertex3.subt(vertex1)
        this.planeNormalV = this.sideLeg1.cross(this.sideLeg2)
        if (this.planeNormalV.magnSqr() === 0) {
            throw 'triangle verteces are colinear'
        }
        this.planeNormalV = vertex1.componentInDirectionOf(this.planeNormalV)
        console.log('plane norml (2) = ' + this.planeNormalV)  // TODO
        console.log('plane norm normed = ' + this.planeNormalV.normalized())
        console.log('len = ', this.planeNormalV.magn())
    }
    interceptDistance(ray) {
        const v1 = ray.getOrigin().componentInDirectionOf(this.planeNormalV)
        const v2 = this.planeNormalV.subt(v1)
        const v3 = ray.getDirection()
        const dot = v2.dot(v3)
        // console.log('dot = ', dot)
        if (dot <= 0) {
            // console.log('null at null')
            return null
        }
        const v4 = v3.componentInDirectionOf(this.planeNormalV)
        const m = v4.magn()
        const dist = 30
        return dist
    }
    handle(ray) {
        return [0.9,0.7,0.4]  // TODO
    }
}

export default Triangle