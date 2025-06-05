import OpticalObject from "../day15/optical-object.js"

class Plane extends OpticalObject {
    constructor(level) {
        super()
        if (typeof level !== 'number') {
            throw 'non-number level given'
        }
        this.level = level
    }
    interceptDistance(ray) {
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
        let intensity = 100/(x*x+y*y+100)
        if (!isWhite) { intensity *= 0.3 }
        return ray.color.scalarMult(intensity)
    }
}

export default Plane