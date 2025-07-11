import SVGGridGrapher from "./svg-grid-grapher.js";
import GenericGridGrapher from "./gen-grid-grapher.js";

class BiVariantGrapher {
    constructor(gridder,width,height,pixelSize,pixelsPerUnit = 1,bvf,antiAlias = 1) {
        if (!(gridder instanceof GenericGridGrapher)){
            throw 'not an instance of GenericGridGrapher'
        }
        this.gridder = gridder
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
        if (typeof antiAlias !== 'number' || 
            Number.isNaN(antiAlias) ||
            antiAlias !== Math.floor(antiAlias) ||
            antiAlias < 1 || antiAlias > 5) {
                throw 'invalid antiAlias argument'
            }       
        this.gridder.init(width,height,pixelSize)
        this.width = width
        this.height = height
        this.antiAlias = antiAlias
        this.usingAntiAlias = (this.antiAlias !== 1)
        if (this.usingAntiAlias) {
            this.antiAliasDelta = 1/(this.pixelsPerUnit*this.antiAlias)
            this.antiAliasOffset = (1-this.antiAlias)/2*this.antiAliasDelta
            this.antiAliasMultiplier = this.antiAlias**(-2)
        }
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
                let realColorArray = null
                if (!this.usingAntiAlias) {
                    realColorArray = this.colorFunction(x,y)
                } else {
                    realColorArray = [0,0,0]
                    for (let ii=0;ii<this.antiAlias;ii++) {
                        let xx = x+ii*this.antiAliasDelta+this.antiAliasOffset
                        for (let jj=0;jj<this.antiAlias;jj++) {
                            let yy = y+jj*this.antiAliasDelta+this.antiAliasOffset
                            let addendColor = this.colorFunction(xx,yy)
                            for (let k=0;k<3;k++) {
                                realColorArray[k] += addendColor[k]
                            }
                        }
                    }
                    realColorArray = realColorArray.map(itm=>itm*this.antiAliasMultiplier)
                }
                let pixelColor = null
                if (this.#validColorArray(realColorArray)) {
                    pixelColor = this.#bracketRealColor(realColorArray)
                } else {
                    pixelColor = [0,0,0]
                }
                this.gridder.putPixel(i,j,...pixelColor)
            }
        }
        return this.gridder.getHTMLElement()
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