import GenericGridGrapher from "./gen-grid-grapher.js"

class CanvasGridGrapher extends GenericGridGrapher {
    constructor() {
        super()
    }
    init(width,height,pixelSize) { 
        const MAXDIM = 1024  // TODO
        this.#validate(width,'width',MAXDIM)
        this.#validate(height,'height',MAXDIM)
        this.#validate(pixelSize,'pixelSize',100)
        this.pixWidth = width
        this.pixHeight = height
        this.pixelSize = pixelSize
        this.width = width*pixelSize
        this.height = height*pixelSize
        if (this.width > MAXDIM || this.height > MAXDIM) {
            throw 'image dimension(s) exceed ' + MAXDIM
        }
        this.canvElem = document.createElement('canvas')
        if (!this.canvElem) {
            throw 'canvas element could not be created'
        }
        this.canvElem.width = this.width
        this.canvElem.height = this.height
        this.ctx = this.canvElem.getContext('2d')  // ctx = context
        if (!this.ctx) {
            throw 'unable to obtain 2D context for canvas element'
        }
        this.ctx.fillStyle = '#0000ff'  // black as initial default value
        this.ctx.fillRect(0,0,this.width,this.height)
    }

    #validate(n,nameOfN,limit) {
        if (typeof n !== 'number') {
            throw nameOfN + ' is not a number'
        }
        if (Number.isNaN(n)) {
            throw nameOfN + ' is NaN'
        }
        if (!Number.isInteger(n)) {
            throw nameOfN + ' is not an integer'
        }
        if (n <= 0) {
            throw nameOfN + ' is zero or negative'
        }
        if (limit) {
            if (n > limit) {
                throw nameOfN + ' exceeds limit of ' + limit + ' having value = ' + n
            }
        }
    }

    getHTMLElement() { 
        return this.canvElem
    }

    putPixel(column,row,rr,gg,bb) {
        let fillColor = this.#fillFromRGB(rr,gg,bb)
        if (fillColor) {
            this.ctx.fillStyle = fillColor
            if (Number.isInteger(column) && column >= 0 && column < this.pixWidth &&
                Number.isInteger(row) && row >= 0 && row < this.pixHeight) {
                    this.ctx.fillRect(this.pixelSize*column,this.pixelSize*row,
                        this.pixelSize,this.pixelSize)
                } else {
                    console.error('invalid coordinates = ', column, row)
                }
        }
    }

    #fillFromRGB(rr,gg,bb) {
        // TODO - validate
        let str = '#'
        let arr = [rr,gg,bb]
        arr.forEach(itm=>str+=itm.toString(16).padStart(2,'0'))
        return str
    }

}

export default CanvasGridGrapher