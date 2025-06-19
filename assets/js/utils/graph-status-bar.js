// GraphicStatusReportBar.js
// Self-contained status/progress bar for reporting progress in the UI

class GraphicStatusReportBar {
    /**
     * @param {string|HTMLElement} elemOrId - The id of the div or the div element itself
     */
    constructor(elemOrId) {
        // Get the original element
        let origElem = (typeof elemOrId === 'string')
            ? document.getElementById(elemOrId)
            : elemOrId;
        if (!origElem) throw new Error('Status bar element not found');
        // Get template from attribute or use default
        this.statusTemplate = origElem.getAttribute('status-template') || 'Status: $perc% complete';
        // Create new structure
        const container = document.createElement('div');
        container.className = 'progress-container';
        // Progress bar
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.id = origElem.id + '-bar';
        // Status text
        const text = document.createElement('p');
        text.className = 'progress-status-text';
        text.id = origElem.id + '-text';
        // Compose
        container.appendChild(bar);
        container.appendChild(text);
        // Replace original element
        origElem.parentNode.replaceChild(container, origElem);
        // Store refs
        this.containerElem = container;
        this.barElem = bar;
        this.textElem = text;
        this.reset();
    }

    /**
     * Set progress as a fraction (0 to 1)
     * @param {number} frac
     */
    setProgress(frac) {
        if (typeof frac !== 'number' || isNaN(frac)) {
            console.error('Status is non-number');
            return;
        }
        let p = Math.round(Math.max(0, Math.min(1, frac)) * 1000) / 10;
        p = p.toFixed(1);
        this.barElem.style.width = `${p}%`;
        this.textElem.textContent = this.statusTemplate.replace('$perc', p);
    }

    /**
     * Set a custom status message (does not affect bar width)
     * @param {string} msg
     */
    setStatus(msg) {
        this.textElem.textContent = msg;
    }

    /**
     * Reset the bar to 0% and default text
     */
    reset() {
        this.setProgress(0);
    }
}

export default GraphicStatusReportBar; 