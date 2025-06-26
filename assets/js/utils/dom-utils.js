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

/**
 * Sets image dimensions based on container size and quality settings
 * @param {HTMLElement} imgParagraph - The container element
 * @param {boolean} isHiQuality - Whether to use high quality settings
 * @param {number} defaultWidth - Default width when container logic fails
 * @param {number} minWidth - Minimum acceptable width
 * @param {number} maxWidth - Maximum width for responsive sizing
 * @param {number} aspectRatio - Height/width ratio (default 0.75 for 4:3, 1.0 for square)
 * @param {number} pixelSizeThreshold - Width threshold for pixel size adjustment
 * @returns {Object} Object containing targetWidth, targetHeight, pixelSize, and antiAlias
 */
export function setImageDimensions(imgParagraph, isHiQuality = false, defaultWidth = 800, minWidth = 100, maxWidth = 600, aspectRatio = 0.75, pixelSizeThreshold = 512) {
    if (!imgParagraph || !(imgParagraph instanceof HTMLElement)) {
        console.error('setImageDimensions: Invalid imgParagraph element provided');
        return {
            targetWidth: defaultWidth,
            targetHeight: Math.round(defaultWidth * aspectRatio),
            pixelSize: 1,
            antiAlias: 3
        };
    }
    
    let targetWidth, pixelSize, antiAlias;
    
    if (isHiQuality) {
        // High quality mode: use default width
        targetWidth = defaultWidth;
        pixelSize = 1;
        antiAlias = 5;
    } else {
        // Responsive mode: use container width with constraints
        const containerWidth = innerPixelWidth(imgParagraph);
        
        if (containerWidth >= minWidth && containerWidth <= maxWidth) {
            targetWidth = containerWidth;
        } else {
            targetWidth = defaultWidth;
        }
        
        // Adjust pixel size based on target width and custom threshold
        pixelSize = (targetWidth <= pixelSizeThreshold ? 1 : 3);
        antiAlias = 3;
    }
    
    const targetHeight = Math.round(targetWidth * aspectRatio);
    
    return {
        targetWidth,
        targetHeight,
        pixelSize,
        antiAlias
    };
} 