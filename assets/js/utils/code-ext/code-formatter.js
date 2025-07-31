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
        const contentDiv = this._createContentStructure(contentStr, doShiftLeft, codeType, "titled-code-exc")
        outerDiv.appendChild(contentDiv)
        return outerDiv
    }
    formatUntitledExcerptElement(contentStr,doShiftLeft=true,codeType) {
        const outerDiv = document.createElement("div")
        outerDiv.className = "untitled-code"
        const contentDiv = this._createContentStructure(contentStr, doShiftLeft, codeType, "untitled-code-exc")
        outerDiv.appendChild(contentDiv)
        
        // Add extra blank line
        const blankLine = document.createElement("div")
        blankLine.innerHTML = "&nbsp;"
        blankLine.style.height = "0.3em"
        outerDiv.appendChild(blankLine)
        
        // Add scroll instruction
        const scrollInstruction = document.createElement("div")
        scrollInstruction.className = "scroll-instruction"
        scrollInstruction.textContent = "(Scroll code horizontally if necessary.)"
        outerDiv.appendChild(scrollInstruction)
        
        return outerDiv
    }
    _createContentStructure(contentStr, doShiftLeft, codeType, className) {
        const contentDiv = document.createElement("div")
        contentDiv.className = className
        const preElem = document.createElement("pre")
        const codeElem = document.createElement("code")
        codeElem.textContent = ((doShiftLeft)?this.shiftLeft(contentStr):contentStr)
        codeElem.innerHTML = this.formatComments(codeElem.innerHTML,codeType)
        preElem.appendChild(codeElem)
        contentDiv.appendChild(preElem)
        return contentDiv
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
            case 'html':
            case 'xml':
            case 'svg':
                const commentRegexXml = /&lt;!--([\s\S]*?)--&gt;/g
                const newContentXml = htmlContent.replace(commentRegexXml,replacementSpan)
                return newContentXml
            default:
                console.error('unexpected codeType "' + codeType + '" ignored')
                return htmlContent
        }
    }
    /**
     * Inserts a horizontal resource index into the given container. Clicking a filename opens a popup with the file's contents, formatted.
     * @param {HTMLElement|string} containerElemOrId - The container element or its ID.
     * @param {string[]} fileListArray - Array of file paths (relative or absolute).
     * @param {Object} options - Optional: { codeType: 'js'|'css'|'html'|... }
     */
    insertResourceIndex(containerElemOrId, fileListArray, options={}) {
        const codeType = options.codeType || 'js';
        let container = (typeof containerElemOrId === 'string') ? document.getElementById(containerElemOrId) : containerElemOrId;
        if (!container) {
            console.error('Resource index container not found:', containerElemOrId);
            return;
        }
        container.classList.add('resource-index-bar');
        // Clear previous content
        container.innerHTML = '';
        // Create the horizontal list
        const listDiv = document.createElement('div');
        listDiv.className = 'resource-index-list';
        fileListArray.forEach(filePath => {
            const baseName = filePath.split('/').pop();
            const link = document.createElement('a');
            link.href = '#';
            link.className = 'resource-index-link';
            link.textContent = baseName;
            link.title = filePath;
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                // Show popup with file contents
                try {
                    const response = await fetch(filePath);
                    if (!response.ok) throw new Error('Failed to fetch ' + filePath);
                    const content = await response.text();
                    const popup = this._createResourcePopup(baseName, content, codeType);
                    document.body.appendChild(popup);
                } catch (err) {
                    alert('Could not load file: ' + filePath + '\n' + err);
                }
            });
            listDiv.appendChild(link);
        });
        container.appendChild(listDiv);
    }

    _createResourcePopup(title, content, codeType) {
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'resource-popup-overlay';
        overlay.tabIndex = -1;
        // Popup box
        const popupBox = document.createElement('div');
        popupBox.className = 'resource-popup-box';
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'resource-popup-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.title = 'Close';
        closeBtn.onclick = () => overlay.remove();
        // Dismiss on overlay click (but not popup box)
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        // Code content
        const codeElem = this.formatTitledExcerptElement(title, content, true, codeType);
        // Assemble
        popupBox.appendChild(closeBtn);
        popupBox.appendChild(codeElem);
        overlay.appendChild(popupBox);
        // Keyboard: ESC to close
        overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.remove(); });
        setTimeout(() => overlay.focus(), 0);
        return overlay;
    }
}

export default CodeFormatter