class NumberInputReplacer {
    constructor(id) {
        if (typeof id === 'string') { // assume is id
            const elem = document.getElementById(id)
            if (!elem) {
                throw 'no "' + id + '" id found for new NumberInputReplacer'
            }
            this.#init(elem)
        } else {
            throw 'invalid parameter for new NumberInputReplacer, must be id string'
        }
    }
    #init(elem) {
        this.intRequired = (elem.getAttribute("intrequired") !== null)
        this.min = this.#getValueFromAttribute(elem,"min")
        this.max = this.#getValueFromAttribute(elem,"max")
        this.val = this.#getValueFromAttribute(elem,"value")
        if (this.intRequired) {
            this.min = Math.floor(this.min)
            this.max = Math.floor(this.max)
            this.val = Math.floor(this.val)
        }
        this.label = elem.getAttribute("lbl")
        if (typeof this.label === 'string') {
            this.label = this.label.trim()
        }
        this.max = Math.max(this.min,this.max)
        this.val = Math.max(this.min,this.val)
        this.val = Math.min(this.max,this.val)
        this.div = document.createElement("div")
        const labelElem = document.createElement("label")
        labelElem.setAttribute("for",elem.getAttribute("id")) // TODO
        labelElem.textContent = this.label + " "
        // labelElem.style.width = "30em"
        this.div.appendChild(labelElem)
        this.inputElem = document.createElement("input")
        this.inputElem.setAttribute("type","number")
        this.inputElem.setAttribute("id",elem.getAttribute("id")) // TODO
        this.inputElem.setAttribute("min",this.min)
        this.inputElem.setAttribute("max",this.max)
        this.inputElem.setAttribute("value",this.val)
        this.inputElem.style.width = "7em"
        this.inputElem.style.textAlign = "right"
        this.#addInputListener()
        this.div.appendChild(this.inputElem)
        elem.replaceWith(this.div)
    }
    #addInputListener() {
        this.inputElem.addEventListener('change',()=>{
            let value = this.inputElem.value
            try {
                value = (this.intRequired?parseInt(value):parseFloat(value))
                if (Number.isNaN(value)) {
                    value = this.min
                }
            } catch (err) {
                console.error('forced to minimum for parse error in input formatter', err)
                value = this.min
            }
            this.val = Math.max(Math.min(value,this.max),this.min)
            this.inputElem.value = this.val
        })
    }
    #getValueFromAttribute(elem,attrName) {
        let value = elem.getAttribute(attrName) 
        if (value === null) {
            value = 0   
        } else {
            try {
                value = parseFloat(value)
            } catch (err) {
                console.error('bad parse, defaulting to zero ', err)
                value = 0
            }
            if (this.intRequired) {
                value = Math.round(value)
            }
        }
        return value
    }
    value() {
        return this.val
    }
}

export { NumberInputReplacer }
