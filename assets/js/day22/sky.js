import OpticalObject from "../day20/optical-object.js";
import Color from "../day20/color.js"

class Sky extends OpticalObject {
    static SKY_BLUE = Color.colorFromHex("#85a4e6")
    static HORIZ_DUSK = Color.colorFromHex("#f2efd3")
    static WHITE = new Color()
    interceptDistance() {
        return Number.POSITIVE_INFINITY
    }
    colorOfDirection(dir) {
        const z = dir.normalized().getZ()
        const zMod = z**0.15
        const z2 = 1-zMod
        const skyColor = Sky.SKY_BLUE.scalarMult(zMod).add(Sky.HORIZ_DUSK.scalarMult(z2))
        return skyColor
    }
    handle(ray) {
        const skyColor = this.colorOfDirection(ray.getDirection())
        // const newColor = ray.color.map((prim,idx)=>prim*skyColor[idx])
        const newColor = ray.color.filter(skyColor)
        return newColor
    }
}

export default Sky