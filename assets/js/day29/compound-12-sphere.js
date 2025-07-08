import OpticalObjectGroup from "../day25/optobj-group.js"
import Vector3D from "../day20/vector3d.js"
import ReflectiveSphere from "./reflective-sphere.js"

class Compound12Sphere extends OpticalObjectGroup {
    constructor(center,radius1,radius2,color,scatter=0) {
        const K = Math.PI/180
        const TH1 = 36*K
        const TH2 = 120*K
        const cos36 = Math.cos(TH1)
        const sin36 = Math.sin(TH1)
        const cos120 = Math.cos(TH2)
        const cosDist = (cos120+cos36**2)/(sin36**2)
        const dist = Math.acos(cosDist)
        const vertices = []
        const vertLatLons = [
            [0,0],
            [dist,0],
            [dist,TH1*2],
            [dist,TH1*4],
            [dist,TH1*6],
            [dist,TH1*8],
            [Math.PI-dist,TH1],
            [Math.PI-dist,TH1*3],
            [Math.PI-dist,TH1*5],
            [Math.PI-dist,TH1*7],
            [Math.PI-dist,TH1*9],
            [Math.PI,0]
        ]
        vertLatLons.forEach(latLon=>{
            const lat = latLon[0]
            const lon = latLon[1]
            const z = Math.cos(lat)
            const sinLat = Math.sin(lat)
            const x = Math.cos(lon)*sinLat
            const y = Math.sin(lon)*sinLat
            const r2 = x*x + y*y + z*z
            if (r2 < 0.999 || r2 > 1.001) {
                throw 'unexpected result from lat / lon'
            }
            vertices.push(new Vector3D(x,y,z).scalarMult(radius1).add(center))
        })
        let optObjList = []
        vertices.forEach(vert=>{
            optObjList.push(new ReflectiveSphere(vert,radius2,color,scatter))
        })
        super(center,radius1+radius2,optObjList)
    }
}

export default Compound12Sphere