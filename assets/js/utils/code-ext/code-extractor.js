import PatternMatcher from "./pattern-matcher.js"

class CodeExtractor {
    constructor() {
        this.patternMatcher = new PatternMatcher();
    }
    
    async getCodeLines(codeUrl,firstLine,lastLine) {
        const response = await fetch(codeUrl)
        if (!response.ok) {
            throw new Error(`response status: ${response.status}`)
        }
        const data = await response.text()
        const codeLines = data.split('\n')
        const extCodeLines = codeLines.slice(firstLine-1,lastLine)
        let str = ''
        extCodeLines.forEach(line=>str += (line+'\n'))
        return str
    }
    
    /**
     * Get full file content
     * @param {string} codeUrl - URL of the file to fetch
     * @returns {Promise<string>} Full file content
     */
    async getFullFile(codeUrl) {
        const response = await fetch(codeUrl)
        if (!response.ok) {
            throw new Error(`response status: ${response.status}`)
        }
        return await response.text()
    }
    
    /**
     * Get code lines by pattern matching
     * @param {string} codeUrl - URL of the file to fetch
     * @param {string|Object} startPattern - Pattern to find start line
     * @param {string|Object|null} endPattern - Pattern to find end line (optional)
     * @returns {Promise<string>} Extracted code lines
     */
    async getCodeByPattern(codeUrl, startPattern, endPattern) {
        const fullContent = await this.getFullFile(codeUrl);
        const { startLine, endLine } = this.patternMatcher.findPatternBoundaries(fullContent, startPattern, endPattern);
        return await this.getCodeLines(codeUrl, startLine, endLine);
    }
}

export default CodeExtractor