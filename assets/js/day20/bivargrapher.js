import Gridder from "./gridder.js";
import Color from "./color.js"

class BiVariantGrapher {
    constructor(gridder,width,height,pixelSize,pixelsPerUnit = 1,bvf,antiAlias = 1) {
        if (!(gridder instanceof Gridder)){
            throw 'not an instance of Gridder'
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
            this.setFunction(bvf)
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
        // One-off test
        const result = this.colorFunction(0,0)
        if (!(result instanceof Color)) {
            throw 'function bvf did not return instance of Color on initial test'
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
                let avgColor = null
                if (!this.usingAntiAlias) {
                    avgColor = this.colorFunction(x,y)
                } else {
                    let componentColors = []
                    for (let ii=0;ii<this.antiAlias;ii++) {
                        let xx = x+ii*this.antiAliasDelta+this.antiAliasOffset
                        for (let jj=0;jj<this.antiAlias;jj++) {
                            let yy = y+jj*this.antiAliasDelta+this.antiAliasOffset
                            let addendColor = this.colorFunction(xx,yy)
                            componentColors.push(addendColor)
                        }
                    }
                    avgColor = Color.avg(componentColors)
                }
                const pixelColor = avgColor.getPrimaryBytes()
                this.gridder.putPixel(i,j,...pixelColor)
            }
        }
        return this.gridder.getHTMLElement()
    }
}

export default BiVariantGrapher