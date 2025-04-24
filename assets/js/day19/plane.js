import OpticalObject from "./optical-object.js"
import Ray from "./ray.js"

class Plane extends OpticalObject {
    constructor(level) {
        super()
        if (typeof level !== 'number') {
            throw 'non-number level given'
        }
        this.level = level
    }
    interceptDistance(ray) {
        if (! ray instanceof Ray) {
            throw 'attempt to interceptDistance() on non-Ray'
        }
        const dir = ray.getDirection()
        const zDir = dir.getZ()
        if (zDir === 0) {
            return null
        }
        const org = ray.getOrigin()
        const zOrg = org.getZ()
        const mult = (this.level-zOrg)/zDir
        if (mult <= 0) {
            return null
        }
        return mult*dir.magn()
    }
    handle(ray) {
        if (! ray instanceof Ray) {
            throw 'attempt to handle() on non-Ray'
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
        let x = Math.floor(org.getX()+mult*dir.getX())
        let y = Math.floor(org.getY()+mult*dir.getY())
        let isWhite = ((x+y)%2 === 0)
        const intense = 100/(x*x+y*y+100)
        return (isWhite?[intense*ray.color[0],intense*ray.color[1],intense*ray.color[2]]:[0.3*intense*ray.color[0],0.3*intense*ray.color[1],0.3*intense*ray.color[2]])
    }
}

export default Plane