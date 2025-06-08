import OpticalObject from "../day20/optical-object.js";
import Color from "../day20/color.js"

class NightSky extends OpticalObject {
    static DARK_SKY_COLOR = Color.colorFromHex("#0f1213")
    static HORIZ_GLOW = Color.colorFromHex("#403d39")
    colorOfDirection(dir) {
        const z = dir.normalized().getZ()
        const zMod = z**0.15
        const z2 = 1-zMod
        const skyColor = NightSky.DARK_SKY_COLOR.scalarMult(zMod).add(NightSky.HORIZ_GLOW.scalarMult(z2))
        return skyColor
    }
    interceptDistance (ray) {
        return Number.POSITIVE_INFINITY
    }
    handle (ray) {
        let skyColor = this.colorOfDirection(ray.getDirection())
        return skyColor.filter(ray.color)
    }
}

export default NightSky