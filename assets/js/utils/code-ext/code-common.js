import CodeExtractor from "./code-extractor.js"
import CodeFormatter from "./code-formatter.js"

class CommonCodeUtility {
    constructor() {
        this.extractor = new CodeExtractor()
        this.formatter = new CodeFormatter()
        
        // Debug: Check if the new methods are available
        console.log('CommonCodeUtility constructor - extractor methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.extractor)));
        console.log('CommonCodeUtility constructor - getCodeByPattern available:', typeof this.extractor.getCodeByPattern);
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
    
    /**
     * Insert titled code excerpt using pattern matching
     * @param {string|HTMLElement} elemOrId - Element or element ID to replace
     * @param {string} codeFileName - File path to extract from
     * @param {string|Object} startPattern - Pattern to find start line
     * @param {string|Object|null} endPattern - Pattern to find end line (optional)
     * @param {string} title - Title for the code excerpt
     * @param {boolean} doLeftShift - Whether to remove common leading whitespace
     * @param {string} codeType - Type of code for syntax highlighting
     */
    async insertTitledCodeByPattern(elemOrId, codeFileName, startPattern, endPattern, title, doLeftShift = true, codeType = 'js') {
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
        
        try {
            const codeLinesAsString = await codex.getCodeByPattern(codeFileName, startPattern, endPattern)
            if (!codeLinesAsString) {
                console.error('error retrieving code lines from ', codeFileName)
                return
            }
            element.replaceWith(codef.formatTitledExcerptElement(title, codeLinesAsString, doLeftShift, codeType))
        } catch (error) {
            console.error('error in pattern-based code extraction:', error.message)
        }
    }
    
    /**
     * Insert untitled code excerpt using pattern matching
     * @param {string|HTMLElement} elemOrId - Element or element ID to replace
     * @param {string} codeFileName - File path to extract from
     * @param {string|Object} startPattern - Pattern to find start line
     * @param {string|Object|null} endPattern - Pattern to find end line (optional)
     * @param {boolean} doLeftShift - Whether to remove common leading whitespace
     * @param {string} codeType - Type of code for syntax highlighting
     */
    async insertUntitledCodeByPattern(elemOrId, codeFileName, startPattern, endPattern, doLeftShift = true, codeType = 'js') {
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
        
        try {
            const codeLinesAsString = await codex.getCodeByPattern(codeFileName, startPattern, endPattern)
            if (!codeLinesAsString) {
                console.error('error retrieving code lines from ', codeFileName)
                return
            }
            element.replaceWith(codef.formatUntitledExcerptElement(codeLinesAsString, doLeftShift, codeType))
        } catch (error) {
            console.error('error in pattern-based code extraction:', error.message)
        }
    }
}

export default CommonCodeUtility