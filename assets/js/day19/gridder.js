// an 'abstract' class

class Gridder {
    constructor() {
        // TODO?
    }
    init(width,height,pixelSize) { /* abstract */ }

    getHTMLElement() { /* abstract */ }

    putPixel(column,row,rr,gg,bb) { /* abstract */ }

}

export default Gridder