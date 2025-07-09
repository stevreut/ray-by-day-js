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
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
`;

    // First, draw ray extensions (behind everything else)
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

    // Project and draw each 3D line
    lines3D.forEach(line => {
        const start2D = project3DTo2D(line.start);
        const end2D = project3DTo2D(line.end);
        
        svgContent += `  <line x1="${start2D.x}" y1="${start2D.y}" x2="${end2D.x}" y2="${end2D.y}" 
    stroke="${line.color}" stroke-width="${PROJECTED_LINE_WIDTH}"/>
`;
    });

    // Project and draw cell midpoints if enabled
    if (PROJECT_MIDPOINTS) {
        const midpoints = generateGridMidpoints();
        midpoints.forEach(midpoint => {
            const point2D = project3DTo2D(midpoint.point);
            svgContent += `  <circle cx="${point2D.x}" cy="${point2D.y}" r="1.5" fill="${midpoint.color}"/>
`;
        });
        
        // Draw rays from common origin to each cell midpoint
        midpoints.forEach(midpoint => {
            const origin2D = project3DTo2D(RAY_ORIGINATION_POINT);
            const endpoint2D = project3DTo2D(midpoint.point);
            svgContent += `  <line x1="${origin2D.x}" y1="${origin2D.y}" x2="${endpoint2D.x}" y2="${endpoint2D.y}" 
    stroke="${RAY_COLOR}" stroke-width="0.5"/>
`;
        });
    }

    svgContent += '</svg>';
    return svgContent;
}

function main() {
    try {
        const svgContent = generateSVG();
        const outputPath = path.join(__dirname, '../../../tools-outputs/svg-graphics/seq11-ray-projects-scene.svg');
        
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