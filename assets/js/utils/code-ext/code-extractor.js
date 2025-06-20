class CodeExtractor {
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
}

export default CodeExtractor