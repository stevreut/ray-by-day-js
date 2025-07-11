import GenericGridGrapher from './gen-grid-grapher.js'
import { makeSvgElem, makeSvgRectangle } from "../day4/svgutils.js"

class SVGGridGrapher extends GenericGridGrapher {
    constructor () {
        super()
        // this.init(width,height,pixelSize)
    }
    init(width,height,pixelSize,pixelBorderColor = null) { 
        const MAXDIM = 1024 // TODO
        if (!this.#validInt(width,1,MAXDIM)) {
            throw 'invalid width'
        }
        if (!this.#validInt(height,1,MAXDIM)) {
            throw 'invalid height'
        }
        if (!this.#validInt(pixelSize,1,100)) {
            // No exception - just use default
            pixelSize = 1
        }
        if (pixelBorderColor !== null && !this.#validColor(pixelBorderColor)) {
            // No exception - just default
            pixelBorderColor = null
        }
        this.defaultColor = '#000000'
        this.pixelBorderColor = pixelBorderColor
        this.width = width
        this.height = height
        this.pixelSize = pixelSize
        this.trueWidth = this.width * this.pixelSize
        this.trueHeight = this.height * this.pixelSize
        this.svg = makeSvgElem('svg',{
            width: this.trueWidth,
            height: this.trueHeight,
            viewBox: '0 0 ' + this.trueWidth + ' ' + this.trueHeight
        })
        this.svg.style.width = '100%'
        this.svg.style.height = 'auto'
        this.#setDefaultGrid()
    }
    #validInt(n,low,high) {
        if (typeof n !== 'number' || Number.isNaN(n)) {
            return false
        }
        if (n !== Math.floor(n)) {  // must be integer
            return false
        }
        return (n >= low && n <= high)
    }
    #validColor(color) {
        if (typeof color !== 'string' || (color.length !== 7 && color.length !== 4)) {
            return false
        }
        if (color[0] != '#') {  // No named colors allowed
            return false
        }
        for (let i=1;i<color.length;i++) {
            let ch = color[i]
            if (!((ch >= '0' && ch <= '9') ||
                (ch >= 'A' && ch <= 'F') ||
                (ch >= 'a' && ch <= 'f'))) {
                    return false
                }
        }
        return true
    }
    #setDefaultGrid() {
        this.rows = []
        for (let j=0;j<this.height;j++) {
            let row = []
            for (let i=0;i<this.width;i++) {
                let attribs = { fill: this.defaultColor }
                if (this.pixelBorderColor) {
                    attribs.stroke = this.pixelBorderColor
                    attribs.strokeWidth = this.pixelSize/16
                }
                let pixRect = makeSvgRectangle(
                    i*this.pixelSize,j*this.pixelSize,
                    this.pixelSize,this.pixelSize,
                    attribs,this.svg)
                row.push(pixRect)
            }
            this.rows.push(row)
        }
    }
    
    getHTMLElement() {  // overrides Gridder method of same name
        return this.svg
    }

    putPixel(column,row,rr,gg,bb) {  // overrides Gridder method of same name
        if (!(this.#validInt(column,0,this.width-1) && 
                this.#validInt(row,0,this.height-1))) {
            console.error('invalid coordinates', column, ' and ', row, ' ignored')
            return  // no action, just ignore
        }
        rr = this.#safeHexOf(rr)
        gg = this.#safeHexOf(gg)
        bb = this.#safeHexOf(bb)
        let fillColor = '#' + rr + gg + bb
        let pixelRectangle = this.rows[row][column]
        pixelRectangle.setAttribute('fill',fillColor)
    }

    #safeHexOf(color) {
        if (this.#validInt(color,0,255)) {
            return color.toString(16).padStart(2,'0')
        } else {
            console.error('invalid color primary ', color)
            return '00'
        }
    }
}

export default SVGGridGrapher