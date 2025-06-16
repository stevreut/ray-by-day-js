import Color from "./color.js"
import Ray from "./ray.js"

class OpticalObject {

    interceptDistance(ray) {
        return 0
    }

    handle(ray, interceptDistance = null) {
        if (!(ray instanceof Ray)) {
            throw 'attempt to handle non-Ray'
        }
        return new Color()
    }
    
}

export default OpticalObject