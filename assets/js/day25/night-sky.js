import OpticalObject from "../day20/optical-object.js";
import Color from "../day20/color.js"

class NightSky extends OpticalObject {
    static DARK_SKY_COLOR = new Color(0.059, 0.071, 0.075)
    static HORIZ_GLOW = new Color (0.25, 0.24, 0.225)
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