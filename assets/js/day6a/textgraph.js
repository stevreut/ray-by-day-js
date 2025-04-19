import Gridder from './gridder.js'

class TextGraph extends Gridder {
    constructor() {
        super()
        console.log('TextGraph instantiated as super at ', new Date()) // TODO
    }
    init(width,height,pixelSize) {
        // ignore pixelSize
        this.width = width 
        this.height = height 
        this.pixelCount = this.width*this.height
        console.log('this (tgraph) = ', this)
        console.log('pixelCount = ', this.pixelCount)
        this.arr = Array(this.pixelCount).fill([0,0,0])
    }

    getHTMLElement() {
        if (this.arr.length !== this.pixelCount) {
            throw 'unexpected length'
        }
        let valid = true
        const tbl = document.createElement('table')
        const tbody = document.createElement('tbody')
        for (let row=0;row<this.height;row++) {
            const trow = document.createElement('tr')
            for (let col=0;col<this.width;col++) {
                const tdata = document.createElement('td')
                const idx = row*this.width+col
                tdata.textContent = 'X'
                tdata.style.color = 'black'
                let bgColr = '#'
                this.arr[idx].forEach(itm=>bgColr+=itm.toString(16).padStart(2,'0'))
                tdata.style.backgroundColor = bgColr
                tdata.style.margin = '1px'
                tdata.style.width = '15px'
                tdata.style.height = '15px'
                trow.appendChild(tdata)
            }
            tbody.appendChild(trow)
        }
        tbl.appendChild(tbody)
        tbl.style.boxShadow = '0 0 15mm #789'
        tbl.style.backgroundColor = '#888'
        return tbl
    }

    putPixel(column,row,rr,gg,bb) {
        const idx = row*this.width+column
        if (idx < 0 || idx >= this.pixelCount) {
            throw 'idx out of range'
        }
        this.arr[idx] = [rr,gg,bb]
    }

}

export default TextGraph