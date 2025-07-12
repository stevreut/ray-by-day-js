import Plane from "../day22/plane.js"
import Color from "../day20/color.js"

class ImagePlane extends Plane {
    constructor(level, image = null) {
        // Call the parent constructor with hard-coded defaults
        super(level, 1, 1, new Color(1, 1, 1), new Color(0.5, 0.5, 0.5))
        
        // Validate image parameter
        if (image !== null && !(image instanceof HTMLImageElement)) {
            throw 'image must be null or an instance of HTMLImageElement'
        }
        
        // Store image-specific properties
        this.image = image
        
        // Additional properties for image plane functionality
        this.hasImage = image !== null
    }
    
    // Method to set or update image data
    setImage(image) {
        if (image !== null && !(image instanceof HTMLImageElement)) {
            throw 'image must be null or an instance of HTMLImageElement'
        }
        this.image = image
        this.hasImage = image !== null
    }
}

export default ImagePlane 