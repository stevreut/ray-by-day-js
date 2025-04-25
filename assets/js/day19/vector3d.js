class Vector3D {
    #magnVal = null
    #magnSqrVal = null
    #arr
    constructor(x, y, z) {
        if (arguments.length === 0) {
            this.#arr = [0, 0, 0]
            this.#magnSqrVal = 0
            this.#magnVal = 0
        } else if (arguments.length === 3 &&
            typeof x === 'number' &&
            typeof y === 'number' &&
            typeof z === 'number') {
            this.#arr = [x, y, z]
        } else if (arguments.length === 1 &&
            Array.isArray(x) &&
            x.length === 3 &&
            typeof x[0] === 'number' &&
            typeof x[1] === 'number' &&
            typeof x[2] === 'number') {
            this.#arr = [...x]
        } else {
            throw 'invalid constructor argument(s)'
        }
    }
    toString() {
        return this.#arr[0] + 'i' + 
            (this.#arr[1]<0?' - ':' + ') + Math.abs(this.#arr[1]) + 'j' + 
            (this.#arr[2]<0?' - ':' + ') + Math.abs(this.#arr[2]) + 'k'
    }
    getX() {
        return this.#arr[0]
    }
    getY() {
        return this.#arr[1]
    }
    getZ() {
        return this.#arr[2]
    }
    add(vectorAddend) {
        let sum = []
        this.#arr.forEach((itm,idx)=>sum.push(itm+vectorAddend.#arr[idx]))
        return new Vector3D(sum)
    }
    subt(vectorSubt) {
        let sum = []
        this.#arr.forEach((itm,idx)=>sum.push(itm-vectorSubt.#arr[idx]))
        return new Vector3D(sum)
    }
    scalarMult(k) {
        if (typeof k !== 'number') {
            throw 'non-numeric scalar multiplier'
        }
        let resultArr = this.#arr.map(itm=>itm*k)
        return new Vector3D(resultArr)
    }
    dot(vec) {  // scalar product
        let sum = 0
        this.#arr.forEach((itm,idx) => sum+=itm*vec.#arr[idx])
        return sum
    }
    cross(vec) {  // vector product
        let resultArr = []
        for (let i=0;i<3;i++) {
            resultArr.push(
                this.#arr[(i+1)%3]*vec.#arr[(i+2)%3] -
                this.#arr[(i+2)%3]*vec.#arr[(i+1)%3]
            )
        }
        return new Vector3D(resultArr)
    }
    magnSqr() {
        if (this.#magnSqrVal === null) {
            this.#magnSqrVal = 0
            this.#arr.forEach(itm=>this.#magnSqrVal+=itm*itm)
        }
        return this.#magnSqrVal
    }
    magn() {
        if (this.#magnVal === null) {
            this.#magnVal = Math.sqrt(this.magnSqr())
        }
        return this.#magnVal
    }
    normalized() {
        // Returns a unit-length vector having the same direction
        // ... unless 'this' is a null vector, in which case 'this'
        // is returned unaltered
        if (this.magnSqr() === 0) {
            return this
        } else {
            return this.scalarMult(1/this.magn())
        }
    }
    cosAngleBetween(vec) {
        if (this.magn() === 0 || vec.magn() === 0) {
            // Not technically correct, but, for ray-tracing
            // purposes, returning 1 (cos(0)) provides for more
            // graceful handling then throwing an exception
            return 1
        }
        let res = this.dot(vec)/(this.magn()*vec.magn())
        if (Number.isNaN(res) || !Number.isFinite(res)) {
            return 1  // see comment above
        }
        res = Math.min(1,Math.max(-1,res))
        return res
    }
    angleBetween(vec) {
        return Math.acos(this.cosAngleBetween(vec))
    }
    componentInDirectionOf(vec) {
        const m2 = vec.magnSqr()
        if (m2 === 0 || Number.isNaN(m2)) {
            // If the magnitude of 'vec' is zero then requesting
            // the component of 'this' in the direction of 'vec' has
            // no meaning.  For the sake of not unnecessarily crashing
            // processing, we'll return 'this' as the result 
            // rather than throw an exception.
            return this
        }
        return vec.scalarMult(this.dot(vec)/vec.magnSqr())
    }
    reflect(normalVector) {
        const normComp = this.componentInDirectionOf(normalVector)
        const resultant = this.subt(normComp.scalarMult(2))
        return resultant
    }
    refract(normalVector,indexOfRefraction) {
        const normComp = this.componentInDirectionOf(normalVector)
        const otherComp = this.subt(normComp)
        const incidentSine = otherComp.magn()/this.magn()
        const resultantSine = incidentSine/indexOfRefraction
        if (Math.abs(resultantSine) > 1) {
            return this.reflect(normalVector)
        }
        const resultantCosine = Math.sqrt(1-resultantSine**2)
        const resultantVector = normComp.normalized().scalarMult(resultantCosine)
            .add(otherComp.normalized().scalarMult(resultantSine))
        return resultantVector
    }
}

export default Vector3D