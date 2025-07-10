const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Output configuration
const OUTPUT_DIR = path.join(__dirname, '../../../tools-outputs/svg-graphics');

// Unit scale (may change later)
const UNIT = 800;

// SVG configuration
const SVG_WIDTH = Math.round(UNIT * 4 / 3);
const SVG_HEIGHT = UNIT;

// Position constants (will be calculated based on theta)
const X0 = 0.1;
const X1 = 0.3;
const Y1 = 0.15;
const Y3 = 0.9;
const Q = 0.25;
const L = 0.6;

// Arc color constant
const ARC_COLOR = '#2563EB';

// Arc stroke width constant
const ARC_STROKE = 3;

// Colors
const BACKGROUND_COLOR = '#FFFFFF'; // White background
const DARK_ORANGE = '#CC6600';
const LIGHT_ORANGE = '#FFD580';

/**
 * Draw a line segment
 * @param {number} x1 - Starting x coordinate (in UNIT units)
 * @param {number} y1 - Starting y coordinate (in UNIT units, bottom-to-top)
 * @param {number} x2 - Ending x coordinate (in UNIT units)
 * @param {number} y2 - Ending y coordinate (in UNIT units, bottom-to-top)
 * @param {number} strokeWidth - Stroke width (default: 4)
 * @param {string} color - Stroke color (default: "#000000")
 * @returns {string} SVG line element
 */
function drawLine(x1, y1, x2, y2, strokeWidth = 4, color = "#000000") {
    // Convert UNIT-based coordinates to pixel coordinates
    // X coordinates: multiply by UNIT
    // Y coordinates: invert (SVG Y=0 is at top, our Y=0 is at bottom)
    const pixelX1 = x1 * UNIT;
    const pixelY1 = SVG_HEIGHT - (y1 * UNIT);
    const pixelX2 = x2 * UNIT;
    const pixelY2 = SVG_HEIGHT - (y2 * UNIT);
    
    return `  <line x1="${pixelX1}" y1="${pixelY1}" x2="${pixelX2}" y2="${pixelY2}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
}

/**
 * Draw a filled polygon
 * @param {Array} points - Array of points, each point is [x, y] in UNIT units
 * @param {string} color - Fill color in HTML format
 * @returns {string} SVG polygon element
 */
function drawPolygon(points, color) {
    // Convert UNIT-based coordinates to pixel coordinates
    const pixelPoints = points.map(([x, y]) => {
        const pixelX = x * UNIT;
        const pixelY = SVG_HEIGHT - (y * UNIT);
        return `${pixelX},${pixelY}`;
    }).join(' ');
    
    return `  <polygon points="${pixelPoints}" fill="${color}"/>`;
}

/**
 * Draw a circular arc
 * @param {Array} center - Center point [x, y] in UNIT units
 * @param {number} startAngle - Starting angle in radians, clockwise from vertical
 * @param {number} endAngle - Ending angle in radians, clockwise from vertical
 * @returns {string} SVG path element for the arc
 */
function drawArc(center, startAngle, endAngle, arcRadius) {
    // Convert UNIT-based coordinates to pixel coordinates
    const centerX = center[0] * UNIT;
    const centerY = SVG_HEIGHT - (center[1] * UNIT);
    const pixelRadius = arcRadius * UNIT;
    
    // Calculate start and end points using the unit coordinate system formulas
    // x = centerX + radius*sin(angle), y = centerY + radius*cos(angle)
    const startX = centerX + pixelRadius * Math.sin(startAngle);
    const startY = centerY - pixelRadius * Math.cos(startAngle);
    const endX = centerX + pixelRadius * Math.sin(endAngle);
    const endY = centerY - pixelRadius * Math.cos(endAngle);
    
    // Determine sweep direction based on angle order
    let largeArcFlag = 0;
    let sweepFlag = 0;
    
    // Calculate angle difference
    let angleDiff = endAngle - startAngle;
    
    // Normalize angle difference to [0, 2π)
    while (angleDiff < 0) angleDiff += 2 * Math.PI;
    while (angleDiff >= 2 * Math.PI) angleDiff -= 2 * Math.PI;
    
    // Always choose the smaller arc (largeArcFlag = 0)
    largeArcFlag = 0;
    
    // Always use the sweep direction that matches the angle order
    // If startAngle < endAngle, we want positive sweep
    if (startAngle < endAngle) {
        sweepFlag = 1; // Positive sweep (counterclockwise in SVG)
    } else {
        sweepFlag = 0; // Negative sweep (clockwise in SVG)
    }
    
    // Create SVG path
    const pathData = `M ${startX} ${startY} A ${pixelRadius} ${pixelRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`;
    
    return `  <path d="${pathData}" stroke="${ARC_COLOR}" stroke-width="${ARC_STROKE}" fill="none"/>`;
}

/**
 * Generate SVG for light angle visualization
 * @param {number} theta - Angle in radians
 * @param {number} fileNumber - File number for output naming
 */
async function generateLightAngleSVG(theta, fileNumber) {
    console.log(`=== Running: light-angle-20.js with theta=${theta * 180 / Math.PI}° and fileNumber=${fileNumber} ===`);
    
    // Calculate position constants based on theta
    const X2 = X1 + Q * Math.sin(theta) * Math.tan(theta);
    const Y2 = Y1 + Q * Math.sin(theta);
    const X3 = X1 + Q / Math.cos(theta);
    const X4 = 1 - X0;
    const X5 = X2 + L * Math.sin(theta);
    const X6 = X3 + L * Math.sin(theta);
    const Y5 = Y2 + L * Math.cos(theta);
    const Y6 = Y1 + L * Math.cos(theta);
    
    // Arc radius constant
    const ARC_RAD = Q * Math.tan(theta) * 2 / 3;
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Generate output file names
    const OUTPUT_FILE = path.join(OUTPUT_DIR, `seq20-light-angle-${fileNumber}.svg`);
    const PNG_OUTPUT_FILE = path.join(OUTPUT_DIR, `seq20-light-angle-${fileNumber}.png`);
    
    const svg = [];
    svg.push('<?xml version="1.0" encoding="UTF-8"?>');
    svg.push(`<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`);
    
    // Background (white)
    svg.push(`  <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${BACKGROUND_COLOR}"/>`);
    
    // Draw polygons first
    svg.push(drawPolygon([[X1, Y1], [X5, Y5], [X6, Y6], [X3, Y1]], LIGHT_ORANGE));
    
    // Draw lines after polygons
    svg.push(drawLine(X0, Y1, X4, Y1));
    svg.push(drawLine(X1, Y1, X1, Y3));
    svg.push(drawLine(X1, Y1, X5, Y5, 4, DARK_ORANGE));
    svg.push(drawLine(X3, Y1, X6, Y6, 4, DARK_ORANGE));
    svg.push(drawLine(X3, Y1, X2, Y2, 4, DARK_ORANGE));
    
    // Draw arcs last
    svg.push(drawArc([X1, Y1], 0, theta, ARC_RAD));
    svg.push(drawArc([X3, Y1], -Math.PI/2, theta-Math.PI/2, ARC_RAD));
    
    svg.push('</svg>');
    
    // Write SVG file
    fs.writeFileSync(OUTPUT_FILE, svg.join('\n'));
    
    // Convert SVG to PNG with white background
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
    console.log(`Diagram shows light angle visualization for theta=${theta * 180 / Math.PI}°`);
}

/**
 * Main function
 */
async function main() {
    // Generate files for fileNumber from 10 to 50 in increments of 10
    for (let fileNumber = 10; fileNumber <= 50; fileNumber += 10) {
        const theta = fileNumber * Math.PI / 180;
        await generateLightAngleSVG(theta, fileNumber);
    }
    console.log('Light angle generation complete!');
}

// Run the program
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateLightAngleSVG }; 