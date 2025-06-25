/**
 * DOM Utilities Library
 * Provides helper functions for DOM element measurements and manipulations
 */

/**
 * Returns the pixel width of an element excluding padding
 * @param {HTMLElement} element - The DOM element to measure
 * @returns {number} The width in pixels excluding padding, or 0 if element is null/invalid
 */
export function innerPixelWidth(element) {
    if (!element || !(element instanceof HTMLElement)) {
        console.error('innerPixelWidth: Invalid element provided');
        return 0;
    }
    
    try {
        // Get the element's clientWidth (includes content + padding)
        const clientWidth = element.clientWidth;
        
        // Get computed styles to access padding values
        const computedStyle = window.getComputedStyle(element);
        
        // Parse padding values (convert from CSS units to pixels)
        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
        
        // Calculate content width by subtracting padding
        const contentWidth = clientWidth - paddingLeft - paddingRight;
        
        return Math.max(0, contentWidth); // Ensure non-negative result
    } catch (error) {
        console.error('innerPixelWidth: Error calculating width:', error);
        return 0;
    }
}

/**
 * Returns the pixel height of an element excluding padding
 * @param {HTMLElement} element - The DOM element to measure
 * @returns {number} The height in pixels excluding padding, or 0 if element is null/invalid
 */
export function innerPixelHeight(element) {
    if (!element || !(element instanceof HTMLElement)) {
        console.error('innerPixelHeight: Invalid element provided');
        return 0;
    }
    
    try {
        // Get the element's clientHeight (includes content + padding)
        const clientHeight = element.clientHeight;
        
        // Get computed styles to access padding values
        const computedStyle = window.getComputedStyle(element);
        
        // Parse padding values (convert from CSS units to pixels)
        const paddingTop = parseFloat(computedStyle.paddingTop);
        const paddingBottom = parseFloat(computedStyle.paddingBottom);
        
        // Calculate content height by subtracting padding
        const contentHeight = clientHeight - paddingTop - paddingBottom;
        
        return Math.max(0, contentHeight); // Ensure non-negative result
    } catch (error) {
        console.error('innerPixelHeight: Error calculating height:', error);
        return 0;
    }
} 