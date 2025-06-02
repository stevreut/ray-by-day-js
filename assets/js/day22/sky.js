import OpticalObject from "../day20/optical-object.js";

class Sky extends OpticalObject {
    SKY_BLUE = [0.53125,0.8125,0.90625]
    HORIZ_DUSK = [1,253/256,207/256]
    WHITE = [1,1,1]
    interceptDistance() {
        return Number.POSITIVE_INFINITY
    }
    colorOfDirection(dir) {
        const z = dir.normalized().getZ()
        const zMod = z**0.15
        const z2 = 1-zMod
        let skyColor = []
        for (let i=0;i<3;i++) {
            skyColor.push(this.SKY_BLUE[i]*zMod+this.HORIZ_DUSK[i]*z2)
        }
        return skyColor
    }
    handle(ray) {
        const skyColor = this.colorOfDirection(ray.getDirection())
        const newColor = ray.color.map((prim,idx)=>prim*skyColor[idx])
        return newColor
    }
}

export default Sky