class SettingsInputBox {
    constructor(idPrefix,inputLineList,displayRange=true) {
        if (typeof displayRange !== 'boolean') {
            throw 'non-boolean displayRange parameter for new SettingsInputBox'
        }
        this.displayRange = displayRange
        if (["null","undefined"].includes(typeof idPrefix)) {
            this.idPrefix = ''
        } else if (typeof idPrefix === 'string') {
            idPrefix = idPrefix.trim()
            if (idPrefix.length < 1) {
                this.idPrefix = ''
            } else {
                this.idPrefix = idPrefix
            }
        } else {
            throw 'invalid idPrefix on new SettingsInputBox'
        }
        if (!Array.isArray(inputLineList)) {
            throw 'invalid inputLineList on new SettingsInputBox is not an array'
        }
        this.lineList = []
        this.idSet = new Set()
        this.idMap = new Map()
        inputLineList.forEach(lineObj=>this.addInputLineObject(lineObj))
    }
    addInputLineObject(lineObject) {
        if (typeof lineObject !== 'object') {
            throw 'non-object lineObject attempted in new SettingsInputBox'
        }
        const lineItem = {}
        let { label, id, min, max, value, step, intreq } = lineObject
        const BLURB = ' in new SettingsInputBox'
        if (label) {
            if (typeof label === 'string') {
                lineItem.label = label.trim()
            } else {
                lineItem.label = label.toString().trim()
            }
        } else {
            lineItem.label = ''
        }
        if (typeof id !== 'string' || id.length < 1) {
            throw 'invalid id in line object' + BLURB
        }
        const fullId = this.idPrefix + id
        if (this.idSet.has(fullId)) {
            throw 'non-unique id "' + id + '" in line object' + BLURB
        }
        lineItem.id = fullId
        if (typeof min !== 'undefined') {
            lineItem.min = this.#interpretNumeric(min)
        } else {
            lineItem.min = Number.NEGATIVE_INFINITY
        }
        if (typeof max !== 'undefined') {
            lineItem.max = this.#interpretNumeric(max)
        } else {
            lineItem.max = Number.POSITIVE_INFINITY
        }
        lineItem.val = this.#interpretNumeric(value)
        let stepNum = this.#interpretNumeric(step)
        if (stepNum !== 0) {
            lineItem.step = stepNum
        } // else omit step from lineItem
        lineItem.intRequired = ((intreq)?true:false) // TODO - will this convert non-booleans correctly?
        if (lineItem.intRequired) {
            lineItem.min = Math.round(lineItem.min)
            lineItem.max = Math.round(lineItem.max)
            lineItem.val = Math.round(lineItem.val)
            if (typeof lineItem.step === 'number') {
                lineItem.step = Math.round(lineItem.step)
                if (lineItem.step === 0) {
                    delete lineItem.step
                }
            }
        }
        lineItem.max = Math.max(lineItem.max,lineItem.min)
        lineItem.val = Math.min(Math.max(lineItem.val,lineItem.min),lineItem.max)
        lineItem.inputElem = this.#inputElemFromLineItem(lineItem)
        lineItem.tableRow = this.#makeTableRow(lineItem)
        this.lineList.push(lineItem)
        this.idMap.set(fullId,lineItem)
    }
    getTable() {
        const tableElem = document.createElement("table")
        const tableHead = document.createElement("thead")
        const headRow = document.createElement("tr")
        const hdrs = ["Setting","Allowed Range","Value"]
        hdrs.forEach((hdr,idx)=>{
            if (this.displayRange || idx !== 1) {
                const th = document.createElement("th")
                th.textContent = hdr
                headRow.appendChild(th)
            }
        })
        tableHead.appendChild(headRow)
        tableElem.appendChild(tableHead)
        const tableBody = document.createElement("tbody")
        this.lineList.forEach(lineItem=>{
            tableBody.appendChild(lineItem.tableRow)
        })
        tableElem.appendChild(tableBody)
        return tableElem
    }
    #interpretNumeric(val) {
        if (["undefined","null"].includes(typeof val)) {
            return 0
        }
        if (typeof val === 'number') {
            return val
        } else if (typeof val === 'string') {
            try {
                let floatVal = parseFloat(val)
                return floatVal
            } catch (err) {
                console.error(err, 'bad numeric string ' + BLURB + ' "' + val + '"')
                throw 'bad numeric string ' + BLURB + ' "' + val + '"'
            }
        } else {
            throw 'value neither number nor string ' + BLURB
        }
    }
    #inputElemFromLineItem(lineItem) {
        const inputElem = document.createElement("input")
        inputElem.id = lineItem.id
        inputElem.setAttribute("type","number")
        inputElem.value = lineItem.val
        lineItem.numericValue = lineItem.val
        if (lineItem.min) {
            inputElem.setAttribute("min",lineItem.min)
        }
        if (lineItem.max) {
            inputElem.setAttribute("max",lineItem.max)
        }
        if (lineItem.step) {
            inputElem.setAttribute("step",lineItem.step)
        }
        inputElem.addEventListener("change",()=>{
            let valStr = inputElem.value
            let valNum = 0
            try {
                valNum = parseFloat(valStr.trim())
                if (lineItem.intRequired) {
                    valNum = Math.round(valNum)
                }
            } catch (err) {
                console.error('non-number value ', valStr)
                valNum = lineItem.min
            }
            if (lineItem.min) {
                valNum = Math.max(valNum,lineItem.min)
            }
            if (lineItem.max) {
                valNum = Math.min(valNum,lineItem.max)
            }
            inputElem.value = valNum
            lineItem.numericValue = valNum
        })
        return inputElem
    }
    #makeTableRow(lineItem) {
        const row = document.createElement("tr")
        const td1 = document.createElement("td")
        td1.textContent = lineItem.label
        row.appendChild(td1)
        if (this.displayRange) {
            const td2 = document.createElement("td")
            let text = null
            if (!lineItem.min && !lineItem.max) {
                text = 'any value'
            } else if (lineItem.min && !lineItem.max) {
                text = 'from ' + lineItem.max
            } else if (!lineItem.min && lineItem.max) {
                text = 'up to ' + lineItem.max
            } else {
                text = lineItem.min + ' to ' + lineItem.max
            }
            td2.textContent = text
            row.appendChild(td2)
            const td3 = document.createElement("td")
            td3.appendChild(lineItem.inputElem)
            row.appendChild(td3)
        }
        return row
    }
    get(id) {
        if (typeof id !== 'string' || id.trim().length < 1) {
            throw 'attempt to get value from empty id in SettingsInputBox'
        }
        const fullId = this.idPrefix+id
        const item = this.idMap.get(fullId)
        if (item) {
            return item.numericValue
        } else {
            throw 'no entity with id "' + fullId + '" found'
        }
    }
}

export default SettingsInputBox