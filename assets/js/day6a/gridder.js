// an 'abstract' class

class Gridder {
    constructor() {
        console.log('Gridder instantiated as super at ', new Date()) // TODO
    }
    init(width,height,pixelSize) { /* abstract */ }

    getHTMLElement() { /* abstract */ }

    putPixel(column,row,rr,gg,bb) { /* abstract */ }

}

export default Gridder