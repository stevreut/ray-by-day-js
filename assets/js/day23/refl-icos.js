import OpticalObject from "../day20/optical-object.js";
import Color from "../day20/color.js"
import ReflectiveTriangle from "./reflective-triangle.js";
import Sphere from "../day20/sphere.js";
import Vector3D from "../day20/vector3d.js";

class ReflectiveIcosahedron extends OpticalObject {
    constructor(center,radius,color) {
        super()
        // TODO - strict validation later
        this.center = center
        this.radius = radius
        this.color = color
        this.sphere = new Sphere(this.center,this.radius,new Color(),new Vector3D(0,0,1))
        this.initTriangles()
    }
    initTriangles() {
        const A1 = Math.atan(2)
        const A2 = Math.PI-A1
        const A3 = Math.PI/5
        const A4 = A3*2
        this.verts = []
        const self = this
        pv(0,0)
        for (let i=0;i<5;i++) {
            pv(A1,i*A4)
        }
        for (let i=0;i<5;i++) {
            pv(A2,i*A4+A3)
        }
        pv(Math.PI,0)
        this.triangles = []
        picos(0,1,2)
        picos(0,2,3)
        picos(0,3,4)
        picos(0,4,5)
        picos(0,5,1)
        //---
        picos(1,2,6)
        picos(2,3,7)
        picos(3,4,8)
        picos(4,5,9)
        picos(5,1,10)
        //---
        picos(6,7,2)
        picos(7,8,3)
        picos(8,9,4)
        picos(9,10,5)
        picos(10,6,1)
        //
        picos(6,7,11)
        picos(7,8,11)
        picos(8,9,11)
        picos(9,10,11)
        picos(10,6,11)
        //
        function pv(lat,lon) {
            const z = Math.cos(lat)*self.radius+self.center.getZ()
            const c = Math.sin(lat)*self.radius
            const x = c*Math.cos(lon)+self.center.getX()
            const y = c*Math.sin(lon)+self.center.getY()
            const vect = new Vector3D(x,y,z)
            self.verts.push(vect)
        }
        function picos(a,b,c) {
            const tri = new ReflectiveTriangle(
                self.verts[a],
                self.verts[b],
                self.verts[c],
                self.color
            )
            self.triangles.push(tri)
        }
    }
    
    interceptDistance(ray) {
        // TODO - ultimately perhaps a nested OpticalEnvironment?
        if (this.sphere.interceptDistance(ray) === null) {
            return null  // IMPORTANT!
        }
        let leastDist = null
        let leastDistIdx = null
        this.leastDistIdx = null
        for (let idx=0;idx<this.triangles.length;idx++) {
            let dist = this.triangles[idx].interceptDistance(ray)
            if (dist !== null) {
                if (leastDist === null || dist < leastDist) {
                    leastDist = dist
                    leastDistIdx = idx
                    this.leastDistIdx = idx
                }
            }
        }
        return leastDist
    }
    handle(ray, interceptDistance = null) {
        const dist = interceptDistance ?? this.interceptDistance(ray)  // Use passed distance if available
        if (this.leastDistIdx !== null && this.leastDistIdx >= 0 && this.leastDistIdx < this.triangles.length) {
            return this.triangles[this.leastDistIdx].handle(ray, dist)
        } else {
            console.error('icos leastDistIdx not found')
            return ray // unaltered
        }
    }
}

export default ReflectiveIcosahedron

