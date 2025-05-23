import Ray from "./ray.js"

class OpticalObject {

    interceptDistance(ray) {
        return 0
    }

    handle(ray) {
        if (! ray instanceof Ray) {
            throw 'attempt to handle non-Ray'
        }
        return [1,1,1]
    }
    
}

export default OpticalObject