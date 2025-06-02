import Vector3D from "../day20/vector3d.js"
import Sky from "../day22/sky.js"

class SunnySky extends Sky {
    SUN_YELLOW_BASE = [1,0.98046875,0.6875]
    SUN_MULTIPLIER = 5
    SUN_YELLOW = this.SUN_YELLOW_BASE.map(prim=>prim*this.SUN_MULTIPLIER)
    SUN_COS = 0.999 // TODO - restore to 0.999989 (?)
    SUN_AURA_COS = 0.7
    AURA_MULTIPLIER = 1.6
    AURA_YELLOW = this.SUN_YELLOW_BASE.map(prim=>prim*this.AURA_MULTIPLIER)
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
            skyColor = skyColor.map((prim,idx)=>prim+this.SUN_YELLOW[idx])
        } else if (cosSunAngle >= this.SUN_AURA_COS) {
            let a = (cosSunAngle-this.SUN_AURA_COS)/this.SUN_AURA_COS_COMPLEMENT
            a = a*a
            skyColor = skyColor.map((prim,idx)=>prim+this.AURA_YELLOW[idx]*a)
        }
        const result = ray.color.map((prim,idx)=>prim*skyColor[idx])
        return result
    }
}

export default SunnySky