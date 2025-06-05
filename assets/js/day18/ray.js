import Vector3D from './vector3d.js'
import Color from "../day14/color.js"

class Ray {

    constructor(origin,direction,color) {
        if (!(origin instanceof Vector3D) ||
            !(direction instanceof Vector3D)) {
                throw 'non-Vector3D where Vector3D expected'
        }
        this.orig = origin
        this.dir = direction
        if (['null','undefined'].includes (typeof color)) {
            this.color = new Color()  // white (by default)
        } else if (!(color instanceof Color)) {
            throw 'color parameter not Color instance'
        } else {
            this.color = color
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