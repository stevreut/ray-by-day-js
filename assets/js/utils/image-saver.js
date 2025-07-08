/**
 * Simple Image Saver Module
 * 
 * Handles canvas-to-download functionality for ray traced images.
 * Simple purpose: save canvas as PNG file with timestamped filename.
 */

/**
 * Save a canvas element as a downloadable PNG file
 * @param {string} canvasId - The ID of the canvas element to save
 * @param {string} filenamePrefix - Prefix for the filename (e.g., 'ray-trace-fractal')
 * @param {Function} onComplete - Optional callback function to run after save
 */
export async function saveCanvasAsDownload(canvasId, filenamePrefix, onComplete = null) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) {
        console.warn(`Canvas with ID '${canvasId}' not found`)
        return false
    }
    
    try {
        const url = canvas.toDataURL('image/png')
        if (!url || typeof url !== 'string') {
            console.warn('Failed to generate data URL from canvas')
            return false
        }
        
        const link = document.createElement("a")
        if (!link) {
            console.warn('Failed to create download link')
            return false
        }
        
        link.href = url
        const timestamp = new Date().getTime()
        const filename = `${filenamePrefix}-${timestamp}.png`
        link.download = filename
        
        // Trigger download
        link.click()
        
        // Run completion callback if provided
        if (onComplete && typeof onComplete === 'function') {
            onComplete()
        }
        
        return true
        
    } catch (error) {
        console.error('Error saving image:', error)
        return false
    }
}

/**
 * Save image with common filename prefixes used across day scripts
 * @param {string} canvasId - The ID of the canvas element to save
 * @param {string} dayType - Type of day for filename (e.g., 'fractal', 'rotation', 'lense')
 * @param {Function} onComplete - Optional callback function to run after save
 */
export async function saveRayTraceImage(canvasId, dayType, onComplete = null) {
    const filenamePrefix = `ray-trace-${dayType}`
    return await saveCanvasAsDownload(canvasId, filenamePrefix, onComplete)
}

/**
 * Common day types for consistent filename generation
 */
export const DAY_TYPES = {
    FRACTAL: 'fractal',
    ROTATION: 'rotation', 
    LENSE: 'lense',
    OBJECT_GROUPING: 'with-object-grouping',
    REFLECTION: 'reflection',
    REFRACTION: 'refraction',
    SHADOWS: 'shadows',
    STEREO: 'stereo',
    LENSE_ENHANCED: 'lense-enhanced',
    SCATTERED_REFLECTION: 'scattered-reflection'
} 