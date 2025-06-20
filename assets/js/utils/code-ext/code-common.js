import CodeExtractor from "./code-extractor.js"
import CodeFormatter from "./code-formatter.js"

class CommonCodeUtility {
    constructor() {
        this.extractor = new CodeExtractor()
        this.formatter = new CodeFormatter()
    }
    getCodeExtractor() {
        return this.extractor
    }
    getCodeFormatter() {
        return this.formatter
    }
    async insertTitledCodeAtPreexistingElement(elemOrId,codeFileName,firstLine,lastLine,title,doLeftShift,codeType) {
        let codex = this.extractor
        let codef = this.formatter
        if (typeof codeType === 'string') {
            codeType = codeType.trim().toLowerCase()
        } else {
            codeType = 'js'
        }
        let element = null
        if (elemOrId instanceof HTMLElement) {
            element = elemOrId
        } else if (typeof elemOrId === 'string') {
            element = document.getElementById(elemOrId)
            if (!element) {
                console.error('no id=', elemOrId, ' found for code insertion')
                return
            }
        } else {
            console.error('invalid type for elemOrId param ', elemOrId)
            return
        }
        const codeLinesAsString = await codex.getCodeLines(codeFileName,firstLine,lastLine)
        if (!codeLinesAsString) {
            console.error('error retrieving code lines from ', codeFileName)
            return
        }
        element.replaceWith(codef.formatTitledExcerptElement(title,codeLinesAsString,doLeftShift,codeType))
    }
}

export default CommonCodeUtility