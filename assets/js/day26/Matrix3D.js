import Vector3D from "../day20/vector3d.js"

class Matrix3D {
    #arr = null
    constructor(...args) {
        /* Acceptable args formats 
        *   three vectors
        *   three arrays of three numbers each
        *   array of three arrays of three numbers each
        *   array of three vectors
        * 
        *  In all cases, the outer entity represent a row of
        *   a matrix and the inner entity represents a value
        *   within that row.
        */
        if (args.length === 1) {
            if (!Array.isArray(args)) {
                throw 'single argument is not an array'
            }
            this.#init(args)
        } else if (args.length === 3) {
            if (Array.isArray(args[0])) {
                this.#init([...args])
            } else if (args[0] instanceof Vector3D) {
                let allVectors = true
                let arrArr = []
                args.forEach(arg=>{
                    if (!(arg instanceof Vector3D)) {
                        allVectors = false
                    } else {
                        arrArr.push([arg.getX(),arg.getY(),arg.getY()])
                    }
                })
                if (!allVectors) {
                    throw 'mixed content in constructor argument'
                }
                this.#init(arrArr)
            } else {
                throw 'unexpected content in constructor argument array'
            }
        } else {
            throw 'unexpected argument count'
        }
    }
    #init(arrayOfArrays) {
        if (!Array.isArray(arrayOfArrays) || arrayOfArrays.length !== 3) {
            throw 'invalid type (1)'
        }
        this.#arr = []
        arrayOfArrays.forEach(arr=>{
            const row = []
            if (!Array.isArray(arr) || arr.length !== 3) {
                throw 'invalid type (2)'
            }
            let valid = true
            arr.forEach(item=>{
                if (typeof item !== 'number') {
                    valid = false
                } else {
                    row.push(item)
                }
            })
            if (!valid) {
                throw 'invalid type (3)'
            }
            this.#arr.push(row)
        })
    }
    add(addend) {
        if (!(addend instanceof Matrix3D)) {
            throw 'attempt to add non-Matrix3D'
        }
        const newArr = []
        this.#arr.forEach((row,idx)=>{
            const newRow = []
            row.forEach((item,idx2)=>{
                newRow.push(item+addend.#arr[idx][idx2])
            })
            newArr.push(newRow)
        })
        return new Matrix3D(...newArr)
    }
    mult(factor) {
        if (!(factor instanceof Matrix3D)) {
            throw 'attempt to mult non-Matrix3D'
        }
        const newArr = [[0,0,0],[0,0,0],[0,0,0]]
        for (let j=0;j<3;j++) {
            for (let i=0;i<3;i++) {
                let sum = 0
                for (let k=0;k<3;k++) {
                    sum += this.#arr[j][k]*factor.#arr[k][i]
                }
                newArr[j][i] = sum
            }
        }
        return new Matrix3D(...newArr)
    }
    vectorMult(vector) {
        if (!(vector instanceof Vector3D)) {
            throw 'attempt to Matrix3D.vectorMult non-Vector3D'
        }
        let newArr = []
        const vectArr = [vector.getX(),vector.getY(),vector.getZ()]
        this.#arr.forEach((row,rowNum)=>{
            let sum = 0
            for (let j=0;j<3;j++) {
                sum += row[j]*vectArr[j]
            }
            newArr.push(sum)
        })
        return new Vector3D(newArr)
    }
    static rotorOnX(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        return new Matrix3D(
            [1, 0, 0],
            [0, c, s],
            [0, -s, c]
        )
    }
    static rotorOnY(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        return new Matrix3D(
            [c, 0, s],
            [0, 1, 0],
            [-s, 0, c]
        )
    }
    static rotorOnZ(angle) {
        const c = Math.cos(angle)
        const s = Math.sin(angle)
        return new Matrix3D(
            [c, -s, 0],
            [s, c, 0],
            [0, 0, 1]
        )
    }
    toString() {
        return JSON.stringify(this.#arr)
    }
    static identityMatrix = new Matrix3D([1,0,0],[0,1,0],[0,0,1])
}

export default Matrix3D