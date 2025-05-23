import Vector3D from './vector3d.js'

class Ray {

    constructor(origin,direction,color) {
        if (!origin instanceof Vector3D ||
            !direction instanceof Vector3D) {
                throw 'non-Vector3D where Vector3D expected'
        }
        this.orig = origin
        this.dir = direction
        if (['null','undefined'].includes (typeof color)) {
            this.color = [1,1,1]  // white (by default)
        } else if (Array.isArray(color) && color.length === 3) {
            color.forEach(prim=>{
                if (typeof prim !== 'number') {
                    throw 'invalid color parameter'
                }
            })
            this.color = color
        } else {
            throw 'invalid color parameter'
        }
    }
    getOrigin() {
        return this.orig
    }
    getDirection() {
        return this.dir 
    }
    getColor() {
        return this.color
    }
    toString() {
        let res = '{origin=(' + this.orig
            + ') direction=(' + this.dir
            + ') color=' + this.color.toString() + '}'
        return res
    }

}

export default Ray