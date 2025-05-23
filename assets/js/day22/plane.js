import OpticalObject from "../day20/optical-object.js"
import Ray from "../day20/ray.js"

class Plane extends OpticalObject {
    constructor(level,lightingSpread=10,squareSize=1) {
        super()
        if (typeof level !== 'number') {
            throw 'non-number level given'
        }
        this.level = level
        if (! typeof lightingSpread === 'number') {
            throw 'non-numeric lightingSpread'
        }
        this.lightSpreadSqr = lightingSpread**2
        this.squareSize = squareSize
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
        let x = Math.floor((org.getX()+mult*dir.getX())/this.squareSize)
        let y = Math.floor((org.getY()+mult*dir.getY())/this.squareSize)
        let isWhite = ((x+y)%2 === 0)
        const intense = this.lightSpreadSqr/(x*x+y*y+this.lightSpreadSqr)
        let colorMultiplier = (isWhite?0.15+intense*0.55:0.15) 
        let returnedColor = ray.color.map(prim=>prim*colorMultiplier)
        return returnedColor
    }
}

export default Plane