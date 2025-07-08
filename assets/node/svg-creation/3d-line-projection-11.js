const fs = require('fs');
const path = require('path');

// Import the 3D classes (we'll need to adapt them for Node.js)
class Vector3D {
    constructor(x, y, z) {
        if (arguments.length === 0) {
            this.arr = [0, 0, 0];
        } else if (arguments.length === 3 &&
            typeof x === 'number' &&
            typeof y === 'number' &&
            typeof z === 'number') {
            this.arr = [x, y, z];
        } else if (arguments.length === 1 &&
            Array.isArray(x) &&
            x.length === 3) {
            this.arr = [...x];
        } else {
            throw 'invalid constructor argument(s)';
        }
    }
    
    getX() { return this.arr[0]; }
    getY() { return this.arr[1]; }
    getZ() { return this.arr[2]; }
    
    add(vectorAddend) {
        let sum = [];
        this.arr.forEach((itm, idx) => sum.push(itm + vectorAddend.arr[idx]));
        return new Vector3D(sum);
    }
    
    subt(vectorSubt) {
        let sum = [];
        this.arr.forEach((itm, idx) => sum.push(itm - vectorSubt.arr[idx]));
        return new Vector3D(sum);
    }
    
    scalarMult(k) {
        let resultArr = this.arr.map(itm => itm * k);
        return new Vector3D(resultArr);
    }
    
    dot(vec) {
        let sum = 0;
        this.arr.forEach((itm, idx) => sum += itm * vec.arr[idx]);
        return sum;
    }
    
    cross(vec) {  // vector product
        let resultArr = [];
        for (let i = 0; i < 3; i++) {
            resultArr.push(
                this.arr[(i + 1) % 3] * vec.arr[(i + 2) % 3] -
                this.arr[(i + 2) % 3] * vec.arr[(i + 1) % 3]
            );
        }
        return new Vector3D(resultArr);
    }
    
    magnSqr() {
        let sum = 0;
        this.arr.forEach(itm => sum += itm * itm);
        return sum;
    }
    
    magn() {
        return Math.sqrt(this.magnSqr());
    }
    
    normalized() {
        if (this.magnSqr() === 0) {
            return this;
        } else {
            return this.scalarMult(1 / this.magn());
        }
    }
}

class Matrix3D {
    constructor(...args) {
        if (args.length === 1) {
            this.init(args[0]);
        } else if (args.length === 3) {
            this.init([...args]);
        } else {
            throw 'unexpected argument count';
        }
    }
    
    init(arrayOfArrays) {
        this.arr = [];
        arrayOfArrays.forEach(arr => {
            const row = [];
            arr.forEach(item => {
                if (typeof item !== 'number') {
                    throw 'invalid type';
                } else {
                    row.push(item);
                }
            });
            this.arr.push(row);
        });
    }
    
    vectorMult(vector) {
        let newArr = [];
        const vectArr = [vector.getX(), vector.getY(), vector.getZ()];
        this.arr.forEach((row, rowNum) => {
            let sum = 0;
            for (let j = 0; j < 3; j++) {
                sum += row[j] * vectArr[j];
            }
            newArr.push(sum);
        });
        return new Vector3D(newArr);
    }
    
    static rotorOnX(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix3D(
            [1, 0, 0],
            [0, c, -s],
            [0, s, c]
        );
    }
    
    static rotorOnY(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix3D(
            [c, 0, -s],
            [0, 1, 0],
            [s, 0, c]
        );
    }
    
    static rotorOnZ(angle) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        return new Matrix3D(
            [c, s, 0],
            [-s, c, 0],
            [0, 0, 1]
        );
    }
    
    static identityMatrix = new Matrix3D([1, 0, 0], [0, 1, 0], [0, 0, 1]);
}

// Constants
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
const FOV = Math.PI / 4; // 45 degrees field of view
const CAMERA_DISTANCE = 10;

// Camera setup
const cameraPosition = new Vector3D(8, 6, 12); // Back to original position
const cameraTarget = new Vector3D(0, 0, 0); // Point toward center of cube
const cameraUp = new Vector3D(0, 1, 0);

// 3D lines to project
const lines3D = [
    // Cube edges
    { start: new Vector3D(-2, -2, -2), end: new Vector3D(2, -2, -2) },
    { start: new Vector3D(2, -2, -2), end: new Vector3D(2, 2, -2) },
    { start: new Vector3D(2, 2, -2), end: new Vector3D(-2, 2, -2) },
    { start: new Vector3D(-2, 2, -2), end: new Vector3D(-2, -2, -2) },
    
    { start: new Vector3D(-2, -2, 2), end: new Vector3D(2, -2, 2) },
    { start: new Vector3D(2, -2, 2), end: new Vector3D(2, 2, 2) },
    { start: new Vector3D(2, 2, 2), end: new Vector3D(-2, 2, 2) },
    { start: new Vector3D(-2, 2, 2), end: new Vector3D(-2, -2, 2) },
    
    { start: new Vector3D(-2, -2, -2), end: new Vector3D(-2, -2, 2) },
    { start: new Vector3D(2, -2, -2), end: new Vector3D(2, -2, 2) },
    { start: new Vector3D(2, 2, -2), end: new Vector3D(2, 2, 2) },
    { start: new Vector3D(-2, 2, -2), end: new Vector3D(-2, 2, 2) }
];

function project3DTo2D(point3D) {
    // Calculate camera direction (from camera to target)
    const cameraDirection = cameraTarget.subt(cameraPosition).normalized();
    
    // Calculate vector from camera to point
    const toPoint = point3D.subt(cameraPosition);
    
    // Project onto camera direction to get depth
    const depth = toPoint.dot(cameraDirection);
    
    // Calculate perpendicular components for screen coordinates
    const cameraRight = cameraDirection.cross(cameraUp).normalized();
    const cameraUpNormalized = cameraUp.normalized();
    
    // Project onto camera's right and up vectors
    const screenX = toPoint.dot(cameraRight);
    const screenY = toPoint.dot(cameraUpNormalized);
    
    // Perspective projection
    const scale = CAMERA_DISTANCE / Math.max(depth, 0.1); // Avoid division by zero
    const x2D = screenX * scale;
    const y2D = screenY * scale;
    
    // Map to SVG coordinates
    const svgX = SVG_WIDTH / 2 + x2D * 50; // Reduced scale for better fit
    const svgY = SVG_HEIGHT / 2 - y2D * 50 + 100; // Flip Y axis and add offset to center
    
    return { x: svgX, y: svgY };
}

function generateSVG() {
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
`;

    // Project and draw each 3D line
    lines3D.forEach(line => {
        const start2D = project3DTo2D(line.start);
        const end2D = project3DTo2D(line.end);
        
        svgContent += `  <line x1="${start2D.x}" y1="${start2D.y}" x2="${end2D.x}" y2="${end2D.y}" 
    stroke="#0080ff" stroke-width="2"/>
`;
    });

    svgContent += '</svg>';
    return svgContent;
}

function main() {
    try {
        const svgContent = generateSVG();
        const outputPath = path.join(__dirname, '../../../tools-outputs/svg-graphics/3d-line-projection-11.svg');
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, svgContent);
        console.log(`SVG generated successfully: ${outputPath}`);
        console.log(`3D cube projected to 2D with ${lines3D.length} lines`);
        
    } catch (error) {
        console.error('Error generating SVG:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateSVG, Vector3D, Matrix3D }; 