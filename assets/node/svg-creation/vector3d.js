/**
 * Vector3D class for Node.js SVG generation programs
 * 
 * NOTE: This version is specifically for use with Node.js programs in the svg-creation
 * directory. It is technically distinct from the Vector3D versions used in browser-based
 * ray tracing programs elsewhere in the project. This version is optimized for Node.js
 * module usage and SVG generation workflows.
 */

class Vector3D {
    constructor(x, y, z) {
        if (arguments.length === 0) {
            this.arr = [0, 0, 0];
        } else if (arguments.length === 3 &&
            typeof x === 'number' &&
            typeof y === 'number' &&
            typeof z === 'number') {
            this.arr = [x, y, z];
        } else if (arguments.length === 1 &&
            Array.isArray(x) &&
            x.length === 3) {
            this.arr = [...x];
        } else {
            throw 'invalid constructor argument(s)';
        }
    }
    
    getX() { return this.arr[0]; }
    getY() { return this.arr[1]; }
    getZ() { return this.arr[2]; }
    
    add(vectorAddend) {
        let sum = [];
        this.arr.forEach((itm, idx) => sum.push(itm + vectorAddend.arr[idx]));
        return new Vector3D(sum);
    }
    
    subt(vectorSubt) {
        let sum = [];
        this.arr.forEach((itm, idx) => sum.push(itm - vectorSubt.arr[idx]));
        return new Vector3D(sum);
    }
    
    scalarMult(k) {
        let resultArr = this.arr.map(itm => itm * k);
        return new Vector3D(resultArr);
    }
    
    dot(vec) {
        let sum = 0;
        this.arr.forEach((itm, idx) => sum += itm * vec.arr[idx]);
        return sum;
    }
    
    cross(vec) {  // vector product
        let resultArr = [];
        for (let i = 0; i < 3; i++) {
            resultArr.push(
                this.arr[(i + 1) % 3] * vec.arr[(i + 2) % 3] -
                this.arr[(i + 2) % 3] * vec.arr[(i + 1) % 3]
            );
        }
        return new Vector3D(resultArr);
    }
    
    magnSqr() {
        let sum = 0;
        this.arr.forEach(itm => sum += itm * itm);
        return sum;
    }
    
    magn() {
        return Math.sqrt(this.magnSqr());
    }
    
    normalized() {
        if (this.magnSqr() === 0) {
            return this;
        } else {
            return this.scalarMult(1 / this.magn());
        }
    }
}

module.exports = Vector3D; 