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
    }
    interceptDistance(ray) {
        return 20  // TODO
    }
    handle(ray) {
        return [0.9,0.7,0.4]  // TODO
    }
}

export default Triangle