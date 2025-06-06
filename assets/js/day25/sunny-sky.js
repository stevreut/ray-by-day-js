import Vector3D from "../day20/vector3d.js"
import Sky from "../day22/sky.js"
import Color from "../day20/color.js"

class SunnySky extends Sky {
    static SUN_YELLOW_BASE = new Color(1,0.98046875,0.6875)
    static SUN_MULTIPLIER = 5
    static SUN_YELLOW = SunnySky.SUN_YELLOW_BASE.scalarMult(this.SUN_MULTIPLIER)
    SUN_COS = 0.999 // TODO - restore to 0.999989 (?)
    SUN_AURA_COS = 0.7
    AURA_MULTIPLIER = 1.6
    static AURA_YELLOW = SunnySky.SUN_YELLOW_BASE.scalarMult(this.AURA_MULTIPLIER)
    SUN_AURA_COS_COMPLEMENT = 1-this.SUN_AURA_COS
    constructor(sunDirection) {
        super()
        if (!sunDirection) {
            throw 'no sunDirection provided'
        }
        if (!(sunDirection instanceof Vector3D)) {
            throw 'invalid sunDirection provided, expecting Vector3D'
        }
        if (sunDirection.magnSqr() === 0) {
            throw 'invalid null sunDirection'
        }
        this.sunDir = sunDirection.normalized()
    }
    handle (ray) {
        const dir = ray.getDirection()
        let cosSunAngle = dir.cosAngleBetween(this.sunDir)
        let skyColor = super.colorOfDirection(dir)
        if (cosSunAngle >= this.SUN_COS) {
            // skyColor = skyColor.map((prim,idx)=>prim+this.SUN_YELLOW[idx])
            skyColor = skyColor.add(SunnySky.SUN_YELLOW)
        } else if (cosSunAngle >= this.SUN_AURA_COS) {
            let a = (cosSunAngle-this.SUN_AURA_COS)/this.SUN_AURA_COS_COMPLEMENT
            a = a*a
            // skyColor = skyColor.map((prim,idx)=>prim+this.AURA_YELLOW[idx]*a)
            skyColor = skyColor.add(SunnySky.AURA_YELLOW.scaleMult(a))
        }
        // const result = ray.color.map((prim,idx)=>prim*skyColor[idx])
        const result = ray.color.filter(skyColor)
        return result
    }
}

export default SunnySky