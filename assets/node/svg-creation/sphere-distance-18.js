const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Output configuration
const OUTPUT_DIR = path.join(__dirname, '../../../tools-outputs/svg-graphics');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'seq18-sphere-distance.svg');
const PNG_OUTPUT_FILE = path.join(OUTPUT_DIR, 'seq18-sphere-distance.png');

// SVG configuration
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
const MARGIN = 50;

// Colors
const CIRCLE_STROKE_COLOR = '#0080FF';
const LINE_COLOR = '#AA2222';
const POINT_COLOR = '#EEDD22';
const BACKGROUND_COLOR = 'transparent';

// Geometry configuration
const CIRCLE_CENTER_X = SVG_WIDTH / 2 + 50;  // Slightly right of center
const CIRCLE_CENTER_Y = SVG_HEIGHT / 2 - 30; // Slightly above center
const CIRCLE_RADIUS = 120;
const ORIGIN_X = MARGIN + 30;  // Lower left, outside circle
const ORIGIN_Y = SVG_HEIGHT - MARGIN - 30;
const POINT_RADIUS = 3;
const LINE_WIDTH = 1.5;

/**
 * Calculate intersection points of a line with a circle
 * @param {number} x1 - Line start x
 * @param {number} y1 - Line start y
 * @param {number} x2 - Line end x
 * @param {number} y2 - Line end y
 * @param {number} cx - Circle center x
 * @param {number} cy - Circle center y
 * @param {number} r - Circle radius
 * @returns {Array} Array of intersection points [{x, y}, {x, y}]
 */
function lineCircleIntersection(x1, y1, x2, y2, cx, cy, r) {
    // Vector from line start to end
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Vector from line start to circle center
    const fx = cx - x1;
    const fy = cy - y1;
    
    // Length of line segment squared
    const lenSq = dx * dx + dy * dy;
    
    // Projection of circle center onto line
    const t = Math.max(0, Math.min(1, (fx * dx + fy * dy) / lenSq));
    
    // Closest point on line to circle center
    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;
    
    // Distance from closest point to circle center
    const distToCenter = Math.sqrt((closestX - cx) * (closestX - cx) + (closestY - cy) * (closestY - cy));
    
    // If closest point is outside circle, no intersection
    if (distToCenter > r) {
        return [];
    }
    
    // Distance from closest point to intersection points
    const halfChord = Math.sqrt(r * r - distToCenter * distToCenter);
    
    // Unit vector along line
    const lineLen = Math.sqrt(lenSq);
    const unitX = dx / lineLen;
    const unitY = dy / lineLen;
    
    // Intersection points
    const point1 = {
        x: closestX + halfChord * unitX,
        y: closestY + halfChord * unitY
    };
    
    const point2 = {
        x: closestX - halfChord * unitX,
        y: closestY - halfChord * unitY
    };
    
    return [point1, point2];
}

/**
 * Generate SVG for sphere distance visualization
 */
async function generateSphereDistanceSVG() {
    console.log('=== Running: sphere-distance-18.js ===');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const svg = [];
    svg.push('<?xml version="1.0" encoding="UTF-8"?>');
    svg.push(`<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`);
    
    // Background (transparent)
    svg.push(`  <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${BACKGROUND_COLOR}"/>`);
    
    // Draw the large circle with dark grey perimeter and transparent interior
    svg.push(`  <circle cx="${CIRCLE_CENTER_X}" cy="${CIRCLE_CENTER_Y}" r="${CIRCLE_RADIUS}" fill="transparent" stroke="${CIRCLE_STROKE_COLOR}" stroke-width="4"/>`);
    
    // Draw the center dot with same color as circle and twice the radius
    svg.push(`  <circle cx="${CIRCLE_CENTER_X}" cy="${CIRCLE_CENTER_Y}" r="${POINT_RADIUS * 2}" fill="${CIRCLE_STROKE_COLOR}"/>`);
    svg.push(`  <text x="${CIRCLE_CENTER_X + 8}" y="${CIRCLE_CENTER_Y - 8}" font-family="Arial" font-size="18" font-weight="bold" fill="${CIRCLE_STROKE_COLOR}">C</text>`);
    
    // Draw the origin point (small black filled circle)
    svg.push(`  <circle cx="${ORIGIN_X}" cy="${ORIGIN_Y}" r="${POINT_RADIUS}" fill="${POINT_COLOR}"/>`);
    svg.push(`  <text x="${ORIGIN_X + 1}" y="${ORIGIN_Y - 13}" font-family="Arial" font-size="18" font-weight="bold" fill="${POINT_COLOR}">O</text>`);
    
    // Draw the first line from origin to circle center
    svg.push(`  <line x1="${ORIGIN_X}" y1="${ORIGIN_Y}" x2="${CIRCLE_CENTER_X}" y2="${CIRCLE_CENTER_Y}" stroke="${LINE_COLOR}" stroke-width="${LINE_WIDTH}"/>`);
    
    // Calculate intersection points for the second line
    // This line goes through the circle but not too near the center
    const line2StartX = ORIGIN_X;
    const line2StartY = ORIGIN_Y;
    const line2EndX = CIRCLE_CENTER_X + 170;  // Still 20px right
    const line2EndY = CIRCLE_CENTER_Y + 0;    // Now 80px down from original (-80 to 0)
    
    const intersections = lineCircleIntersection(
        line2StartX, line2StartY, 
        line2EndX, line2EndY, 
        CIRCLE_CENTER_X, CIRCLE_CENTER_Y, 
        CIRCLE_RADIUS
    );
    
    // Draw the second line
    svg.push(`  <line x1="${line2StartX}" y1="${line2StartY}" x2="${line2EndX}" y2="${line2EndY}" stroke="${LINE_COLOR}" stroke-width="${LINE_WIDTH}"/>`);
    
    // Draw isosceles triangle at the end of the second line
    const triangleSize = 12; // Size of the triangle
    const baseSize = 6; // Size of the base (unequal side) - half of triangleSize
    const lineAngle = Math.atan2(line2EndY - line2StartY, line2EndX - line2StartX);
    const perpendicularAngle = lineAngle + Math.PI / 2;
    
    // Calculate triangle points
    const apexX = line2EndX;
    const apexY = line2EndY;
    const baseMidX = line2EndX - triangleSize * Math.cos(lineAngle);
    const baseMidY = line2EndY - triangleSize * Math.sin(lineAngle);
    const baseLeftX = baseMidX + baseSize * Math.cos(perpendicularAngle);
    const baseLeftY = baseMidY + baseSize * Math.sin(perpendicularAngle);
    const baseRightX = baseMidX - baseSize * Math.cos(perpendicularAngle);
    const baseRightY = baseMidY - baseSize * Math.sin(perpendicularAngle);
    
    // Draw the triangle
    svg.push(`  <polygon points="${apexX},${apexY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}" fill="${LINE_COLOR}"/>`);
    
    // Draw intersection points as black circular dots
    if (intersections.length === 2) {
        // Calculate distances from origin to each intersection point
        const dist1 = Math.sqrt((intersections[0].x - ORIGIN_X) * (intersections[0].x - ORIGIN_X) + 
                                (intersections[0].y - ORIGIN_Y) * (intersections[0].y - ORIGIN_Y));
        const dist2 = Math.sqrt((intersections[1].x - ORIGIN_X) * (intersections[1].x - ORIGIN_X) + 
                                (intersections[1].y - ORIGIN_Y) * (intersections[1].y - ORIGIN_Y));
        
        // Determine which is closer (x1) and which is farther (x2)
        const x1 = dist1 < dist2 ? intersections[0] : intersections[1];
        const x2 = dist1 < dist2 ? intersections[1] : intersections[0];
        
        // Draw x1 (closer point)
        svg.push(`  <circle cx="${x1.x}" cy="${x1.y}" r="${POINT_RADIUS}" fill="${POINT_COLOR}"/>`);
        svg.push(`  <text x="${x1.x + 8}" y="${x1.y - 8}" font-family="Arial" font-size="18" font-weight="bold" fill="${POINT_COLOR}">x1</text>`);
        
        // Draw x2 (farther point)
        svg.push(`  <circle cx="${x2.x}" cy="${x2.y}" r="${POINT_RADIUS}" fill="${POINT_COLOR}"/>`);
        svg.push(`  <text x="${x2.x + 8}" y="${x2.y - 8}" font-family="Arial" font-size="18" font-weight="bold" fill="${POINT_COLOR}">x2</text>`);
        
        // Draw thin lines from circle center to each intersection point
        svg.push(`  <line x1="${CIRCLE_CENTER_X}" y1="${CIRCLE_CENTER_Y}" x2="${x1.x}" y2="${x1.y}" stroke="#554444" stroke-width="1"/>`);
        svg.push(`  <line x1="${CIRCLE_CENTER_X}" y1="${CIRCLE_CENTER_Y}" x2="${x2.x}" y2="${x2.y}" stroke="#554444" stroke-width="1"/>`);
    }
    
    svg.push('</svg>');
    
    // Write SVG file
    fs.writeFileSync(OUTPUT_FILE, svg.join('\n'));
    
    // Convert SVG to PNG with transparent background
    console.log('Converting SVG to PNG...');
    try {
        await sharp(Buffer.from(svg.join('\n')))
            .png()
            .toFile(PNG_OUTPUT_FILE);
        console.log(`PNG generated successfully: ${PNG_OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error converting to PNG:', error.message);
    }
    
    console.log(`SVG generated successfully: ${OUTPUT_FILE}`);
    console.log(`Diagram shows sphere distance visualization with:`);
    console.log(`- Large circle with dark grey perimeter and transparent interior`);
    console.log(`- Origin point in lower left (black dot)`);
    console.log(`- Line from origin to circle center`);
    console.log(`- Second line intersecting circle at two points`);
    console.log(`- Intersection points marked with black dots`);
}

// Run the program
generateSphereDistanceSVG().catch(console.error); 