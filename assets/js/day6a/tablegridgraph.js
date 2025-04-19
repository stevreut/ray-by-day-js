import Gridder from './gridder.js'

class TableGridGraph extends Gridder {
    constructor() {
        super()
    }
    init(width,height,pixelSize) {
        this.tdDim = pixelSize-1
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
                tdata.style.margin = '0.5px'
                tdata.style.width = this.tdDim + 'px'
                tdata.style.height = this.tdDim + 'px'
                trow.appendChild(tdata)
            }
            tbody.appendChild(trow)
        }
        tbl.appendChild(tbody)
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

export default TableGridGraph