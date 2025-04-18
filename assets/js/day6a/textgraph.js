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
        this.arr = Array(this.pixelCount).fill(false)
    }

    getHTMLElement() {
        if (this.arr.length !== this.pixelCount) {
            throw 'unexpected length'
        }
        let valid = true
        this.arr.forEach((itm,idx)=>{
            if ((itm !== true && itm !== false) || typeof itm !== 'boolean') {
                valid = false
                console.error('bad value ', itm, ' at ', idx)
            }
        })
        if (!valid) {
            throw 'invalid arr item(s)'
        }
        const tbl = document.createElement('table')
        const tbody = document.createElement('tbody')
        for (let row=0;row<this.height;row++) {
            const trow = document.createElement('tr')
            for (let col=0;col<this.width;col++) {
                const tdata = document.createElement('td')
                const idx = row*this.width+col
                tdata.textContent = (this.arr[idx]?'*':'.')
                tdata.style.color = 'cyan'
                tdata.style.backgroundColor = 'black'
                tdata.style.margin = '1px'
                tdata.style.width = '15px'
                tdata.style.height = '15px'
                trow.appendChild(tdata)
            }
            tbody.appendChild(trow)
        }
        tbl.appendChild(tbody)
        return tbl
    }

    putPixel(column,row,rr,gg,bb) {
        const idx = row*this.width+column
        if (idx < 0 || idx >= this.pixelCount) {
            throw 'idx out of range'
        }
        this.arr[idx] = (gg >= 128)
    }

}

export default TextGraph