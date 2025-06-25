// an 'abstract' class

class GenericGridGrapher {
    constructor() {
        // TODO?
    }
    init(width,height,pixelSize) { /* abstract */ }

    getHTMLElement() { /* abstract */ }

    putPixel(column,row,rr,gg,bb) { /* abstract */ }

}

export default GenericGridGrapher