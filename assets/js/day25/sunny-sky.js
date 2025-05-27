import Vector3D from "../day20/vector3d.js"
import Sky from "../day22/sky.js"

class SunnySky extends Sky {
    SUN_YELLOW_BASE = [1,1,0.6875] //[1,0.9,0.5]
    SUN_MULTIPLIER = 3
    SUN_YELLOW = this.SUN_YELLOW_BASE.map(prim=>prim*this.SUN_MULTIPLIER)
    SUN_COS = 0.999989
    SUN_AURA_COS = 0.7
    constructor(sunDirection) {
        super()
        console.log('SunnySky constructor invoked')
        console.log('sunDirection = ', sunDirection)
        if (!sunDirection) {
            throw 'no sunDirection provided'
        }
        if (!sunDirection instanceof Vector3D) {
            throw 'invalid sunDirection provided, expecting Vector3D'
        }
        if (sunDirection.magnSqr() === 0) {
            throw 'invalid null sunDirection'
        }
        this.sunDir = sunDirection.normalized()
    }
    handle (ray) {
        let result = super.handle(ray)
        let cosSunAngle = ray.getDirection().cosAngleBetween(this.sunDir)
        if (cosSunAngle >= this.SUN_COS) {  // TODO
            result = result.map((prim,idx)=>prim+this.SUN_YELLOW[idx])
        } else if (cosSunAngle >= this.SUN_AURA_COS) {
            let k = (cosSunAngle-this.SUN_AURA_COS)/(1-this.SUN_AURA_COS)
            k = k*k
            k *= 0.2 // TODO
            result = result.map((prim,idx)=>prim+this.SUN_YELLOW[idx]*k)
        }
        return result
    }
}

export default SunnySky