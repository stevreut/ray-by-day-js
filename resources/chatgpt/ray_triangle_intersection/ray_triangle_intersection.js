
// Vector3D class stub (for context)
class Vector3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    subtract(v) {
        return new Vector3D(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vector3D(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    magn() {
        return Math.sqrt(this.dot(this));
    }

    magnSqr() {
        return this.dot(this);
    }

    normalized() {
        const mag = this.magn();
        return new Vector3D(this.x / mag, this.y / mag, this.z / mag);
    }
}

// Ray-triangle intersection function
function rayIntersectsTriangle(rayOrigin, rayDirection, v0, v1, v2, epsilon = 1e-6) {
    const e1 = v1.subtract(v0);
    const e2 = v2.subtract(v0);

    const pvec = rayDirection.cross(e2);
    const det = e1.dot(pvec);

    if (Math.abs(det) < epsilon) return null;

    const invDet = 1.0 / det;
    const tvec = rayOrigin.subtract(v0);
    const u = tvec.dot(pvec) * invDet;

    if (u < 0 || u > 1) return null;

    const qvec = tvec.cross(e1);
    const v = rayDirection.dot(qvec) * invDet;

    if (v < 0 || u + v > 1) return null;

    const t = e2.dot(qvec) * invDet;

    return t > epsilon ? t : null;
}

// Example usage
const rayOrigin = new Vector3D(0, 0, 0);
const rayDirection = new Vector3D(0, 0, 1).normalized();
const v0 = new Vector3D(-1, -1, 5);
const v1 = new Vector3D(1, -1, 5);
const v2 = new Vector3D(0, 1, 5);

const distance = rayIntersectsTriangle(rayOrigin, rayDirection, v0, v1, v2);
console.log(distance !== null ? `Intersection at distance ${distance}` : "No intersection");
