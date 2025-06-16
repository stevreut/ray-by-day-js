import CodeExtractor from "./code-extractor.js"

class CodeFormatter {
    formatTitledExcerptElement(title,contentStr,doShiftLeft=true,codeType) {
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
        codeElem.textContent = ((doShiftLeft)?this.shiftLeft(contentStr):contentStr)
        codeElem.innerHTML = this.formatComments(codeElem.innerHTML,codeType)
        preElem.appendChild(codeElem)
        contentDiv.appendChild(preElem)
        outerDiv.appendChild(contentDiv)
        return outerDiv
    }
    shiftLeft(strLines) {
        const inputLines = strLines.split('\n')
        let minPadding = Number.MAX_VALUE
        inputLines.forEach(line=>{
            if (line.trim().length !== 0) {
                let leadCount = (line.length - line.trimStart().length)
                minPadding = Math.min(minPadding,leadCount)
            }
        })
        if (minPadding === Number.MAX_VALUE) {
            return strLines
        }
        let newStr = ""
        inputLines.forEach(line=>{
            let truncLine = line.slice(Math.min(line.length,minPadding))
            newStr += (truncLine + '\n')
        })
        while (strLines.length > 0 && strLines[strLines.length-1] === '\n') {
            strLines = strLines.slice(0,strLines.length-1)
        }
        return newStr
    }
    formatComments(htmlContent,codeType) {
        // NOTE: Will not handle complex cases such as commenting embedded
        // within a quoted string, etc.
        if (typeof codeType === 'string') {
            codeType = codeType.trim().toLowerCase()
            if (codeType === '') {
                codeType = 'js'
            } else if (codeType === 'none') {
                return htmlContent
            }
        } else {
            codeType = 'js'
        }
        const replacementSpan = '<span class="comment">$&</span>'
        switch (codeType) {
            case 'js' :
                const commentRegexJs = /((?<!:)\/\/.*)|(\/\*[\s\S]*?\*\/)/g;
                const newContentJs = htmlContent.replace(commentRegexJs,replacementSpan)
                return newContentJs
            case 'css' :
                const commentRegexCss = /(\/\*[\s\S]*?\*\/)/g;
                const newContentCss = htmlContent.replace(commentRegexCss,replacementSpan)
                return newContentCss
            case 'html','xml','svg' :
                const commentRegexXml = /&lt;!--([\s\S]*?)--&gt;/g
                const newContentXml = htmlContent.replace(commentRegexXml,replacementSpan)
                return newContentXml
            default:
                console.error('unexpected codeType "' + codeType + '" ignored')
                return htmlContent
        }
    }
}

export default CodeFormatter