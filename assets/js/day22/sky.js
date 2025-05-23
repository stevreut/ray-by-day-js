import OpticalObject from "../day20/optical-object.js";

class Sky extends OpticalObject {
    SKY_BLUE = [0.53125,0.8125,0.90625]
    HORIZ_DUSK = [1,253/256,207/256]
    WHITE = [1,1,1]
    interceptDistance() {
        return Number.POSITIVE_INFINITY
    }
    handle(ray) {
        const dir = ray.getDirection().normalized()
        const inColor = ray.color
        const z = dir.getZ()
        const zMod = z**0.15
        const z2 = 1-zMod
        let newColor = []
        for (let i=0;i<3;i++) {
            newColor.push((this.SKY_BLUE[i]*zMod+this.HORIZ_DUSK[i]*z2)*inColor[i])
        }
        return newColor
    }
}

export default Sky