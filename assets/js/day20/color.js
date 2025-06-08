class Color {
    constructor(...args) {
        if (arguments.length === 3) {
            this.primaries = [...arguments]
        } else if (arguments.length === 1) {
            this.primaries = [...arguments[0]]
        } else if (arguments.length === 0) {
            this.primaries = [1,1,1]  // white
        } else {
            throw 'invalid argument count for Color object'
        }
        if (this.primaries.length !== 3) {
            console.error ('primaries: ', this.primaries)
            throw 'invalid number of primary colors provided'
        }
        this.primaries.forEach(arg => {
            if (typeof arg !== 'number' || Number.isNaN(arg) || arg < 0) {
                throw 'invalid array component for new Color object'
            }
        })
    }
    toString() {
        return '[' +
            this.primaries[0] + ',' +
            this.primaries[1] + ',' +
            this.primaries[2] + ']'
    }
    getRed() {
        return this.primaries[0]
    }
    getGreen() {
        return this.primaries[1]
    }
    getBlue() {
        return this.primaries[2]
    }
    getPrimaryByte(primaryNum) {
        let val
        if ([0,1,2].includes(primaryNum)) {
            val = this.primaries[primaryNum]
            if (Number.isNaN(val)) {
                val = 0
            }
        } else {
            val = 0
        }
        val = Math.min(1,Math.max(0,val))
        val = Math.round(val*255)
        return Math.round(val)
    }
    getPrimaryBytes() {
        let res = []
        for (let i=0;i<3;i++) {
            res.push(this.getPrimaryByte(i))
        }
        return res
    }
    toColorHexString() {
        let hexStr = '#'
        this.primaries.forEach(prim=>{
            let val = Math.round(Math.max(0,Math.min(1,prim))*255)
            hexStr += val.toString(16).padStart(2,'0')
        })
        return hexStr
    }
    scalarMult(k) {
        if (typeof k !== 'number' || Number.isNaN(k) || k < 0) {
            k = 0  // lenient processing rather than throw an exception
        }
        let newValues = this.primaries.map(val=>val*k)
        return new Color(newValues)
    }
    filter(color) {
        if (!(color instanceof Color)) {
            return this  // lenient processing rather than throw an exception
        }
        let newValues = this.primaries.map((val,idx)=>val*color.primaries[idx])
        return new Color(newValues)
    }
    add(color) {
        if (!(color instanceof Color)) {
            return this  // lenient processing rather than throw an exception
        }
        let newValues = this.primaries.map((val,idx)=>val+color.primaries[idx])
        return new Color(newValues)
    }
    overDistance(dist) {
        let newValues = this.primaries.map(val=>val**dist)
        return new Color(newValues)
    }
    static sum(colors) {
        if (!Array.isArray(colors)) {
            throw 'non-array used as parameter to Color.sum()'
        }
        if (colors.length === 0) {
            return new Color(0,0,0)
        } else if (colors.length === 1) {
            return colors[0]
        }
        let sumColor = [...colors[0].primaries]
        for (let i=1; i<colors.length; i++) {
            sumColor = sumColor.map((elem,idx)=>elem+colors[i].primaries[idx])
        }
        return new Color(sumColor)
    }
    static avg(colors) {
        if (!Array.isArray(colors)) {
            throw 'non-array given to Color.avg()'
        }
        if (colors.length === 0) {
            return new Color(0,0,0)  // lenient processing rather than division by zero
        } else if (colors.length === 1) {
            return colors[0]  // no point in recalculating
        }
        return Color.sum(colors).scalarMult(1/colors.length)
    }
    static colorFromHex(hexString) {
        if (typeof hexString !== 'string' || hexString.length !== 7 ||
            hexString[0] !== '#') {
                throw 'invalid hexString'
        }
        let primaryValues = []
        for (let i=1;i<7;i+=2) {
            let primStr = hexString.substring(i,i+2)
            let primIntVal = parseInt(primStr,16)
            if (primIntVal < 0 || primIntVal > 255) {
                throw 'invalid integer value substring ' + primStr + ' within hexString'
            }
            primaryValues.push(primIntVal/255)
        }
        return new Color(primaryValues)
    }
}

export default Color