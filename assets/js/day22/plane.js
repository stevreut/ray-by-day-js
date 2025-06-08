import OpticalObject from "../day20/optical-object.js"
import Ray from "../day20/ray.js"
import Color from "../day20/color.js"

class Plane extends OpticalObject {
    constructor(level,lightingSpread=10,squareSize=1,lightColor,darkColor) {
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
        if (lightColor instanceof Color) {
            this.lightColor = lightColor
        } else {
            this.lightColor = Color.colorFromHex("#d4d4d4")
        }
        if (darkColor instanceof Color) {
            this.darkColor = darkColor
        } else {
            this.darkColor = new Color(0,0,0)
        }
    }
    interceptDistance(ray) {
        if (!(ray instanceof Ray)) {
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
        if (!(ray instanceof Ray)) {
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
        let intensity = this.lightSpreadSqr/(x*x+y*y+this.lightSpreadSqr)
        let filterColor = null
        if (isWhite) {
            filterColor = this.lightColor.scalarMult(intensity)
        } else {
            filterColor = this.darkColor.scalarMult(intensity)
        }
        filterColor = filterColor.add(this.darkColor.add(this.lightColor).scalarMult(0.3))
        return ray.color.filter(filterColor)
    }
}

export default Plane