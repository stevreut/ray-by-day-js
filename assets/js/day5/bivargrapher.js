import GridGraph from "../day4/gridgraph.js";

class BiVariantGrapher {
    constructor(width,height,pixelSize,pixelsPerUnit = 1,bvf) {
        if (typeof pixelsPerUnit !== 'number' ||
            Number.isNaN(pixelsPerUnit) ||
            pixelsPerUnit <= 0) {
                throw 'invalid pixelsPerUnit'
            }
        this.pixelsPerUnit = pixelsPerUnit
        if (!bvf) {
            this.colorFunction = null
        } else {
            if (typeof bvf !== 'function') {
                throw 'bvf argument is not a function'
            } else {
                this.colorFunction = bvf
            }
        }
        this.grid = new GridGraph(width,height,pixelSize,'#ffffff' /*TODO*/)
        this.width = width
        this.height = height
    }
    setFunction(bvf) {
        if (typeof bvf !== 'function') {
            throw 'bvf argument is not a function'
        } else {
            this.colorFunction = bvf
        }
    }
    drawGraph() {
        if (!this.colorFunction) {
            throw 'function not defined'
        }
        for (let j=0;j<this.height;j++) {
            let y = (this.height/2-j)/this.pixelsPerUnit  // TODO
            for (let i=0;i<this.width;i++) {
                let x = (i-this.width/2)/this.pixelsPerUnit  // TODO
                let realColorArray = this.colorFunction(x,y)
                let pixelColor = null
                if (this.#validColorArray(realColorArray)) {
                    pixelColor = this.#bracketRealColor(realColorArray)
                } else {
                    pixelColor = [0,0,0]
                }
                this.grid.putPixel(i,j,...pixelColor)
            }
        }
        return this.grid.getHTMLElement()
    }
    #validColorArray(arr) {
        if (!Array.isArray(arr) || arr.length !== 3) {
            return false
        }
        let isValid = true
        arr.forEach(num=>{
            if (typeof num !== 'number' || Number.isNaN(num)) {
                isValid = false
            }
        })
        return isValid
    }
    #bracketRealColor(rColr) {
        let pixCol = rColr.map(prim=>{
            let realPrim = prim*255
            realPrim = Math.min(255,Math.max(0,realPrim))
            return Math.round(realPrim)
        })
        return pixCol
    }
}

export default BiVariantGrapher