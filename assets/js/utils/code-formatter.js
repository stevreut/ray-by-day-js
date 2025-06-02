import CodeExtractor from "./code-extractor.js"

class CodeFormatter {
    formatTitledExcerptElement(title,contentStr) {
        const outerDiv = document.createElement("div")
        outerDiv.className = "titled-code"
        const titleDiv = document.createElement("div")
        titleDiv.className = "titled-code-title"
        const titleCodeElem = document.createElement("code")
        titleCodeElem.textContent = title
        titleDiv.appendChild(titleCodeElem)
        outerDiv.appendChild(titleDiv)
        const contentDiv = document.createElement("div")
        contentDiv.className = "titled-code-exc"
        const preElem = document.createElement("pre")
        const codeElem = document.createElement("code")
        codeElem.textContent = contentStr
        preElem.appendChild(codeElem)
        contentDiv.appendChild(preElem)
        outerDiv.appendChild(contentDiv)
        return outerDiv
    }
}

export default CodeFormatter