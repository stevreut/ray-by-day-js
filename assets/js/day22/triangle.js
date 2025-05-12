import OpticalObject from "../day19/optical-object.js";
import Vector3D from "../day19/vector3d.js";

class Triangle extends OpticalObject {
    constructor (vertex1, vertex2, vertex3, color) {
        super()
        this.color = color // TODO - validation
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
        // const v1 = ray.getOrigin().componentInDirectionOf(this.planeNormalV)
        // const v2 = this.planeNormalV.subt(v1)
        // const v3 = ray.getDirection()
        // const dot = v2.dot(v3)
        // // console.log('dot = ', dot)
        // if (dot <= 0) {
        //     // console.log('null at null')
        //     return null
        // }
        // const v4 = v3.componentInDirectionOf(this.planeNormalV)
        // const m = v4.magn()
        // const dist = 30
        // return dist

        // Note the normalization of the ray's direction vector.  This, it was
        // discovered at 11:00 p.m. EDT 5/11/2025, is required by function
        // rayIntersectsTriange().
        const result = rayIntersectsTriangle(ray.getOrigin(), ray.getDirection().normalized(),
             ...this.verts /*epsilon defaulted*/)
        return result 

        // function rayIntersectsTriangle() provided by ChatGPT on
        // May 11, 2025 and used herein without alteration (so far)
        function rayIntersectsTriangle(rayOrigin, rayDirection, v0, v1, v2, epsilon = 1e-6) {
            const e1 = v1.subt(v0); // altered
            const e2 = v2.subt(v0); // altered

            const pvec = rayDirection.cross(e2);
            const det = e1.dot(pvec);

            if (Math.abs(det) < epsilon) return null;

            const invDet = 1.0 / det;
            const tvec = rayOrigin.subt(v0); // altered
            const u = tvec.dot(pvec) * invDet;

            if (u < 0 || u > 1) return null;

            const qvec = tvec.cross(e1);
            const v = rayDirection.dot(qvec) * invDet;

            if (v < 0 || u + v > 1) return null;

            const t = e2.dot(qvec) * invDet;

            return t > epsilon ? t : null;
        }
    }
    handle(ray) {
        const rColor = ray.color
        const color = this.color.map((prim,idx)=>prim*rColor[idx])
        return color
    }
}

export default Triangle