import Plane from "../day22/plane.js"
import Color from "../day20/color.js"
import Ray from "../day20/ray.js"

class ImagePlane extends Plane {
    constructor(level, image = null, width = null, doTiling = true, defaultColor = null) {
        // Call the parent constructor with hard-coded defaults
        super(level, 1, 1, new Color(1, 1, 1), new Color(0.5, 0.5, 0.5))
        
        // Validate width parameter
        if (width !== null && (typeof width !== 'number' || width <= 0)) {
            throw 'width must be null or a positive number'
        }
        
        // Validate doTiling parameter
        if (typeof doTiling !== 'boolean') {
            throw 'doTiling must be a boolean'
        }
        
        // Validate defaultColor parameter
        if (defaultColor !== null && !(defaultColor instanceof Color)) {
            throw 'defaultColor must be null or an instance of Color'
        }
        
        this.tileWidth = width
        this.doTiling = doTiling
        this.defaultColor = defaultColor !== null ? defaultColor : new Color(0, 0, 0) // Default to black
        
        this._setImage(image)
    }
    
    // Method to set or update image data
    setImage(image) {
        this._setImage(image)
    }
    
    // ImagePlane rely on the super class implementation of interceptDistance()

    _setImage(image) {
        // Validate image parameter
        if (image !== null && !(image instanceof HTMLImageElement)) {
            throw 'image must be null or an instance of HTMLImageElement'
        }
        
        // Store image-specific properties
        this.image = image
        this.hasImage = image !== null
        
        // Store image dimensions and aspect ratio if image is available
        if (this.hasImage) {
            this._processImageData(image)
        } else {
            this.imageWidth = 0
            this.imageHeight = 0
            this.aspectRatio = 0
            this.canvas = null
            this.pixelColors = null
        }
    }

    _processImageData(image) {
        this.imageWidth = image.naturalWidth
        this.imageHeight = image.naturalHeight
        this.aspectRatio = this.imageWidth / this.imageHeight
        
        // Create canvas once and extract pixel data as Color objects
        this.canvas = document.createElement('canvas')
        this.canvas.width = this.imageWidth
        this.canvas.height = this.imageHeight
        const ctx = this.canvas.getContext('2d')
        ctx.drawImage(image, 0, 0)
        const imageData = ctx.getImageData(0, 0, this.imageWidth, this.imageHeight)
        const data = imageData.data
        
        // Create 2D array of Color objects
        this.pixelColors = []
        for (let y = 0; y < this.imageHeight; y++) {
            this.pixelColors[y] = []
            for (let x = 0; x < this.imageWidth; x++) {
                const pixelIndex = (y * this.imageWidth + x) * 4
                const r = data[pixelIndex] / 255
                const g = data[pixelIndex + 1] / 255
                const b = data[pixelIndex + 2] / 255
                this.pixelColors[y][x] = new Color(r, g, b)
            }
        }
    }

    handle(ray) {
        if (!(ray instanceof Ray)) {
            throw 'attempt to handle() on non-Ray'
        }
        
        // If no image is available, fall back to super class behavior
        if (!this.hasImage) {
            return super.handle(ray)
        }
        
        const dir = ray.getDirection()
        const zDir = dir.getZ()
        if (zDir === 0) {
            return ray.color
        }
        const org = ray.getOrigin()
        const zOrg = org.getZ()
        const mult = (this.level-zOrg)/zDir
        if (mult <= 0) {
            return ray.color
        }
        
        // Calculate intersection point on the plane
        const intersectionX = org.getX() + mult * dir.getX()
        const intersectionY = org.getY() + mult * dir.getY()
        
        // Map plane coordinates to image coordinates
        // Use tileWidth for scaling if provided, otherwise 1 unit = full image width
        const scaleX = this.tileWidth !== null ? this.tileWidth : 1
        const scaleY = this.tileWidth !== null ? this.tileWidth * this.aspectRatio : 1
        
        let imageX, imageY
        
        if (this.doTiling) {
            // Normalize coordinates to 0-1 range for tiling
            const normalizedX = ((intersectionX % scaleX + scaleX) % scaleX) / scaleX
            const normalizedY = ((intersectionY % scaleY + scaleY) % scaleY) / scaleY
            
            // Convert to image coordinates and flip Y
            imageX = Math.floor(normalizedX * this.imageWidth)
            imageY = Math.floor((1 - normalizedY) * this.imageHeight)
        } else {
            // For non-tiling, check if intersection is within image bounds
            if (intersectionX < 0 || intersectionX >= scaleX || 
                intersectionY < 0 || intersectionY >= scaleY) {
                // Outside image bounds, use defaultColor if provided, otherwise fall back to super class behavior
                return ray.color.filter(this.defaultColor)
            }
            
            // Within image bounds, map to image coordinates
            const normalizedX = intersectionX / scaleX
            const normalizedY = intersectionY / scaleY
            
            // Convert to image coordinates and flip Y
            imageX = Math.floor(normalizedX * this.imageWidth)
            imageY = Math.floor((1 - normalizedY) * this.imageHeight)
        }
        
        // Ensure coordinates are within image bounds
        const clampedX = Math.max(0, Math.min(this.imageWidth - 1, imageX))
        const clampedY = Math.max(0, Math.min(this.imageHeight - 1, imageY))
        
        // Get pixel color from pre-extracted 2D array
        const pixelColor = this.pixelColors[clampedY][clampedX]
        return ray.color.filter(pixelColor)
    }
}

export default ImagePlane 