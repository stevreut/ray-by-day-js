const fs = require('fs');
const path = require('path');
const Vector3D = require('./vector3d.js');

// Constants
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
const GRID_WIDTH = 10;  // Number of grid cells horizontally
const GRID_HEIGHT = 8;  // Number of grid cells vertically
const GRID_COLOR = "#0080ff"; // Color reserved for grids
const PROJECTED_LINE_WIDTH = 2; // Width of projected lines
const RAY_ORIGINATION_POINT = new Vector3D(0, 0, GRID_WIDTH * 2); // Ray origination point
const CELL_MIDPOINT_COLOR = "#aa4400"; // Color for cell midpoint projections (same as rays)
const PROJECT_MIDPOINTS = true; // Boolean to control midpoint projection
const RAY_COLOR = "#aa4400"; // Color for ray projections (subject to change)
const RAY_EXTENSION_COLOR = "#cc6600"; // Color for ray extensions (slightly dimmer orange)
const FOCAL_LENGTH = 10.5;

// Sphere class for 3D spheres
class Sphere {
    constructor(x, y, z, radius, color) {
        this.center = new Vector3D(x, y, z);
        this.radius = radius;
        this.color = color; // String in "#rrggbb" format
    }
}

// Camera setup - cameraTarget is now the midpoint between the grid and the ray origin
const cameraPosition = new Vector3D(20, 1, 11); //Vector3D(11, 7, 15);
const cameraTarget = new Vector3D(0, 0, GRID_WIDTH*0.7); // Midpoint between grid (z=0) and ray origin (z=GRID_WIDTH*2)
const cameraUp = new Vector3D(0, 1, 0);

// Generate 3D grid lines
function generateGridLines() {
    const lines = [];
    
    // Calculate grid dimensions
    const halfWidth = GRID_WIDTH / 2;
    const halfHeight = GRID_HEIGHT / 2;
    
    // Generate vertical lines
    for (let lineNo = 0; lineNo <= GRID_WIDTH; lineNo++) {
        const x = lineNo - halfWidth;
        const start = new Vector3D(x, -halfHeight, 0);
        const end = new Vector3D(x, halfHeight, 0);
        lines.push({ start, end, color: GRID_COLOR });
    }
    
    // Generate horizontal lines
    for (let lineNo = 0; lineNo <= GRID_HEIGHT; lineNo++) {
        const y = lineNo - halfHeight;
        const start = new Vector3D(-halfWidth, y, 0);
        const end = new Vector3D(halfWidth, y, 0);
        lines.push({ start, end, color: GRID_COLOR });
    }
    
    return lines;
}

// Generate grid cell midpoints
function generateGridMidpoints() {
    const midpoints = [];
    
    // Calculate grid dimensions
    const halfWidth = GRID_WIDTH / 2;
    const halfHeight = GRID_HEIGHT / 2;
    
    // Generate midpoints for each grid cell
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            // Calculate the center of each cell
            const cellX = (x - halfWidth) + 0.5; // Center of cell
            const cellY = (y - halfHeight) + 0.5; // Center of cell
            const midpoint = new Vector3D(cellX, cellY, 0);
            
            midpoints.push({ point: midpoint, color: CELL_MIDPOINT_COLOR });
        }
    }
    
    return midpoints;
}

// Generate ray extensions from cell midpoints to z = -WIDTH/3
function generateRayExtensions() {
    const extensions = [];
    const extensionZ = -GRID_WIDTH * 0.6; // Target z-coordinate for extensions
    
    // Calculate grid dimensions
    const halfWidth = GRID_WIDTH / 2;
    const halfHeight = GRID_HEIGHT / 2;
    
    // Generate extensions for each grid cell
    for (let x = 0; x < GRID_WIDTH; x++) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            // Calculate the center of each cell (same as midpoints)
            const cellX = (x - halfWidth) + 0.5;
            const cellY = (y - halfHeight) + 0.5;
            const midpoint = new Vector3D(cellX, cellY, 0);
            
            // Calculate the direction from ray origin to this cell midpoint
            const rayDirection = midpoint.subt(RAY_ORIGINATION_POINT).normalized();
            
            // Calculate the extension endpoint by continuing in the same direction
            // Find the point where the ray intersects z = extensionZ
            const t = (extensionZ - RAY_ORIGINATION_POINT.getZ()) / rayDirection.getZ();
            const extensionPoint = RAY_ORIGINATION_POINT.add(rayDirection.scalarMult(t));
            
            extensions.push({ 
                start: midpoint, 
                end: extensionPoint, 
                color: RAY_EXTENSION_COLOR 
            });
        }
    }
    
    return extensions;
}

// Generate spheres for the scene
function generateSpheres() {
    const spheres = [];
    
    // Sphere 1: Yellow sphere at (5, 0, -2) with radius 2
    spheres.push(new Sphere(5, 0, -2, 2, "#ffff00"));
    
    // Sphere 2: Cyan sphere at (-10, 5, -1) with radius 2
    spheres.push(new Sphere(-10, 5, -2, 2, "#00ffff"));

    // Sphere 3: Red sphere at (0, 0, -2) with radius 2
    spheres.push(new Sphere(0, 0, -2, 2, "#ff0000"));

    spheres.push(new Sphere(0, 0, 4, 2, "#ff00ff"));
    
    return spheres;
}

// Find the closest point on a line segment to another line
function findClosestPointOnLineSegment(lineStart, lineEnd, referenceLineStart, referenceLineEnd) {
    // Convert to direction vectors
    const lineDir = lineEnd.subt(lineStart).normalized();
    const refDir = referenceLineEnd.subt(referenceLineStart).normalized();
    
    // Calculate the closest point using the shortest distance between two lines
    // This is the point on the line segment closest to the reference line
    const w0 = lineStart.subt(referenceLineStart);
    const a = lineDir.dot(lineDir);
    const b = lineDir.dot(refDir);
    const c = refDir.dot(refDir);
    const d = lineDir.dot(w0);
    const e = refDir.dot(w0);
    
    const denom = a * c - b * b;
    if (Math.abs(denom) < 1e-10) {
        // Lines are parallel, use midpoint
        return lineStart.add(lineEnd).scalarMult(0.5);
    }
    
    const sc = (b * e - c * d) / denom;
    const tc = (a * e - b * d) / denom;
    
    // Clamp sc to line segment bounds
    const clampedSc = Math.max(0, Math.min(sc, lineEnd.subt(lineStart).magn()));
    
    // Return the closest point on the line segment
    return lineStart.add(lineDir.scalarMult(clampedSc));
}

// Calculate depth for a line segment relative to a sphere
function calculateLineDepth(lineStart, lineEnd, sphere) {
    // Step 1: Create reference line through camera and sphere center
    const referenceLineStart = cameraPosition;
    const referenceLineEnd = sphere.center;
    
    // Step 2: Find closest point on line segment to reference line
    const closestPoint = findClosestPointOnLineSegment(lineStart, lineEnd, referenceLineStart, referenceLineEnd);
    
    // Step 3: Calculate distance from camera to closest point
    const lineDepth = closestPoint.subt(cameraPosition).magn();
    
    return lineDepth;
}

// Calculate projected radius for a sphere
function calculateSphereProjectionRadius(sphere) {
    // Calculate depth (distance from camera to sphere center)
    const cameraDirection = cameraTarget.subt(cameraPosition).normalized();
    const toSphere = sphere.center.subt(cameraPosition);
    const depth = toSphere.dot(cameraDirection);
    
    // Calculate perspective scaling factor
    const focalLength = FOCAL_LENGTH;
    const scale = focalLength / Math.max(depth, 0.1);
    
    // The projected radius is the sphere's radius scaled by the perspective factor
    const projectedRadius = sphere.radius * scale * 30; // 30 is the SVG scaling factor
    
    return projectedRadius;
}

function project3DTo2D(point3D) {
    // Calculate camera direction (from camera to target)
    // Camera now points at the midpoint between the grid and the ray origin
    const cameraDirection = cameraTarget.subt(cameraPosition).normalized();
    
    // Calculate vector from camera to point
    const toPoint = point3D.subt(cameraPosition);
    
    // Project onto camera direction to get depth
    const depth = toPoint.dot(cameraDirection);
    
    // Calculate perpendicular components for screen coordinates
    const cameraRight = cameraDirection.cross(cameraUp).normalized();
    // const cameraUpNormalized = cameraUp.normalized();
    const cameraUpNormalized = cameraDirection.cross(cameraRight).normalized().scalarMult(-1);
    
    // Project onto camera's right and up vectors
    const screenX = toPoint.dot(cameraRight);
    const screenY = toPoint.dot(cameraUpNormalized);
    
    // Perspective projection with proper scaling
    const focalLength = FOCAL_LENGTH;
    const scale = focalLength / Math.max(depth, 0.1);
    
    const x2D = screenX * scale;
    const y2D = screenY * scale;
    
    // Map to SVG coordinates with better scaling
    const svgX = SVG_WIDTH / 2 + x2D * 30;
    const svgY = SVG_HEIGHT / 2 - y2D * 30;
    
    return { x: svgX, y: svgY };
}

function generateSVG() {
    const lines3D = generateGridLines();
    const spheres = generateSpheres();
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
`;

    // Calculate depth for each sphere to determine rendering order
    const cameraDirection = cameraTarget.subt(cameraPosition).normalized();
    const spheresWithDepth = spheres.map(sphere => {
        // Use distance from camera to sphere center as depth
        const depth = sphere.center.subt(cameraPosition).magn();
        return { sphere, depth };
    });
    
    // Calculate depth of grid (z=0) for comparison
    const gridDepth = new Vector3D(0, 0, 0).subt(cameraPosition).dot(cameraDirection);

    // Debug output
    console.log('Camera position:', cameraPosition);
    console.log('Camera target:', cameraTarget);
    console.log('Grid depth:', gridDepth);
    spheresWithDepth.forEach(({ sphere, depth }, i) => {
        console.log(`Sphere ${i + 1} color: ${sphere.color}, center: (${sphere.center.getX()}, ${sphere.center.getY()}, ${sphere.center.getZ()}), depth:`, depth);
    });
    
    // Sort spheres by depth (farthest first, closest last)
    spheresWithDepth.sort((a, b) => a.depth - b.depth);

    // Render ray extensions (always behind everything)
    if (PROJECT_MIDPOINTS) {
        const rayExtensions = generateRayExtensions();
        rayExtensions.forEach(extension => {
            const start2D = project3DTo2D(extension.start);
            const end2D = project3DTo2D(extension.end);
            
            svgContent += `  <line x1="${start2D.x}" y1="${start2D.y}" x2="${end2D.x}" y2="${end2D.y}" 
    stroke="${extension.color}" stroke-width="0.5"/>
`;
        });
    }

    // Create a list of all objects to render with their depths
    const allObjects = [];
    
    // Add grid lines with their depths
    lines3D.forEach(line => {
        // Calculate grid line depth based on z-coordinate (grid is at z=0)
        const gridDepth = new Vector3D(0, 0, 0).subt(cameraPosition).magn();
        allObjects.push({ 
            type: 'gridline', 
            object: { start: line.start, end: line.end, color: line.color }, 
            depth: gridDepth 
        });
    });
    
    // Add midpoints with their depths
    if (PROJECT_MIDPOINTS) {
        const midpoints = generateGridMidpoints();
        midpoints.forEach(midpoint => {
            const midpointDepth = midpoint.point.subt(cameraPosition).magn();
            allObjects.push({ 
                type: 'midpoint', 
                object: { point: midpoint.point, color: midpoint.color }, 
                depth: midpointDepth 
            });
        });
    }
    
    // Add spheres
    spheresWithDepth.forEach(({ sphere, depth }) => {
        allObjects.push({ type: 'sphere', object: sphere, depth });
    });
    
    // Add rays with their depths
    if (PROJECT_MIDPOINTS) {
        const midpoints = generateGridMidpoints();
        midpoints.forEach(midpoint => {
            // Calculate depth using the new approach: closest point to camera-to-sphere line
            // Use the minimum depth across all spheres to ensure proper ordering
            let minRayDepth = Infinity;
            spheresWithDepth.forEach(({ sphere }) => {
                const rayDepth = calculateLineDepth(RAY_ORIGINATION_POINT, midpoint.point, sphere);
                minRayDepth = Math.min(minRayDepth, rayDepth);
            });
            allObjects.push({ 
                type: 'ray', 
                object: { origin: RAY_ORIGINATION_POINT, endpoint: midpoint.point }, 
                depth: minRayDepth 
            });
        });
    }
    
    // Sort all objects by depth (closest first, farthest last) - SVG renders later elements on top
    allObjects.sort((a, b) => b.depth - a.depth);
    
    // Render all objects in depth order
    allObjects.forEach(obj => {
        if (obj.type === 'sphere') {
            const sphere = obj.object;
            const center2D = project3DTo2D(sphere.center);
            const projectedRadius = calculateSphereProjectionRadius(sphere);
            svgContent += `  <circle cx="${center2D.x}" cy="${center2D.y}" r="${projectedRadius}" fill="${sphere.color}"/>
`;
        } else if (obj.type === 'ray') {
            const ray = obj.object;
            const origin2D = project3DTo2D(ray.origin);
            const endpoint2D = project3DTo2D(ray.endpoint);
            svgContent += `  <line x1="${origin2D.x}" y1="${origin2D.y}" x2="${endpoint2D.x}" y2="${endpoint2D.y}" 
    stroke="${RAY_COLOR}" stroke-width="0.5"/>
`;
        } else if (obj.type === 'gridline') {
            const gridline = obj.object;
            const start2D = project3DTo2D(gridline.start);
            const end2D = project3DTo2D(gridline.end);
            svgContent += `  <line x1="${start2D.x}" y1="${start2D.y}" x2="${end2D.x}" y2="${end2D.y}" 
    stroke="${gridline.color}" stroke-width="${PROJECTED_LINE_WIDTH}"/>
`;
        } else if (obj.type === 'midpoint') {
            const midpoint = obj.object;
            const point2D = project3DTo2D(midpoint.point);
            svgContent += `  <circle cx="${point2D.x}" cy="${point2D.y}" r="1.5" fill="${midpoint.color}"/>
`;
        }
    });

    svgContent += '</svg>';
    return svgContent;
}

function main() {
    try {
        const svgContent = generateSVG();
        const outputPath = path.join(__dirname, '../../../tools-outputs/svg-graphics/ray-projects-scene-12.svg');
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, svgContent);
        console.log(`SVG generated successfully: ${outputPath}`);
        console.log(`3D grid projected to 2D with ${GRID_WIDTH + 1} vertical lines and ${GRID_HEIGHT + 1} horizontal lines`);
        
    } catch (error) {
        console.error('Error generating SVG:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateSVG, Vector3D }; 