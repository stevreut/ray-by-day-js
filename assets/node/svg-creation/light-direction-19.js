const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Output configuration
const OUTPUT_DIR = path.join(__dirname, '../../../tools-outputs/svg-graphics');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'seq19-light-direction.svg');
const PNG_OUTPUT_FILE = path.join(OUTPUT_DIR, 'seq19-light-direction.png');

// SVG configuration
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
const MARGIN = 50;

// Colors
const ARC_COLOR = '#000000';     // Black arc
const BACKGROUND_COLOR = '#FFFFFF'; // White background
const STROKE_WIDTH = 3;
const LINE_HEIGHT = 100;  // Height of vertical line segments (doubled from 50)
const RADIAL_LINE_LENGTH = 100;  // Length of radial lines extending from center
const VERTICAL_COLOR = '#FF8C00';  // Orange color for vertical lines
const RADIAL_COLOR = '#000000';  // Black color for radial lines
const PALE_ORANGE_COLOR = '#FFD580';  // Pale orange color for center-directed lines
const THIN_STROKE_WIDTH = STROKE_WIDTH / 3;  // Thinner stroke width for pale orange lines
const PALE_BLUE_COLOR = '#87CEEB';  // Pale blue color for small circular arcs
const SMALL_ARC_RADIUS = 35;  // Radius for small circular arcs

// Arc configuration - endpoints fixed
const ARC_START_X = MARGIN + 25;  // Half as far from lower left
const ARC_END_X = SVG_WIDTH - MARGIN - 25;  // Half as far from lower right
const ARC_START_Y = SVG_HEIGHT - MARGIN - 10; // Half as far from bottom
const ARC_END_Y = SVG_HEIGHT - MARGIN - 10;   // Half as far from bottom
const ARC_RADIUS = 700;  // Large radius for shallow arc

/**
 * Generate SVG for light direction visualization
 */
async function generateLightDirectionSVG() {
    console.log('=== Running: light-direction-19.js ===');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const svg = [];
    svg.push('<?xml version="1.0" encoding="UTF-8"?>');
    svg.push(`<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`);
    
    // Background (white)
    svg.push(`  <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${BACKGROUND_COLOR}"/>`);
    
    // Create the arc path using fixed endpoints, sweepFlag=1 for upward arc
    const arcPath = `M ${ARC_START_X} ${ARC_START_Y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${ARC_END_X} ${ARC_END_Y}`;
    
    // Draw the arc
    svg.push(`  <path d="${arcPath}" fill="none" stroke="${ARC_COLOR}" stroke-width="${STROKE_WIDTH}"/>`);
    
    // Calculate positions for vertical line segments using analytic geometry
    const line1X = ARC_START_X + (ARC_END_X - ARC_START_X) * 0.75;  // 75% along the arc
    const line2X = ARC_START_X + (ARC_END_X - ARC_START_X) * 0.40;  // 40% along the arc
    const line3X = ARC_START_X + (ARC_END_X - ARC_START_X) * 0.085;  // 8.5% along the arc (moved slightly right)
    
    // Find the center of the circle that forms the arc
    // For an upward arc, the center is below the arc
    const arcCenterX = (ARC_START_X + ARC_END_X) / 2;
    
    // Calculate the correct center Y using the chord midpoint and radius
    const chordLength = Math.sqrt((ARC_END_X - ARC_START_X) ** 2 + (ARC_END_Y - ARC_START_Y) ** 2);
    const distanceFromChordToCenter = Math.sqrt(ARC_RADIUS ** 2 - (chordLength / 2) ** 2);
    const arcCenterY = ARC_START_Y + distanceFromChordToCenter;  // Center below the arc
    
    // Use circle equation: (x - centerX)² + (y - centerY)² = radius²
    // For any X on the arc: y = centerY ± sqrt(radius² - (x - centerX)²)
    // For upward arc, we want the upper Y (negative sqrt)
    const line1DeltaX = line1X - arcCenterX;
    const line2DeltaX = line2X - arcCenterX;
    
    // Calculate Y coordinates on the arc using the correct circle equation
    const line1Y = arcCenterY - Math.sqrt(ARC_RADIUS * ARC_RADIUS - line1DeltaX * line1DeltaX);
    const line2Y = arcCenterY - Math.sqrt(ARC_RADIUS * ARC_RADIUS - line2DeltaX * line2DeltaX);
    
    const line3DeltaX = line3X - arcCenterX;
    const line3Y = arcCenterY - Math.sqrt(ARC_RADIUS * ARC_RADIUS - line3DeltaX * line3DeltaX);
    
    // Debug output
    console.log(`Arc: (${ARC_START_X}, ${ARC_START_Y}) to (${ARC_END_X}, ${ARC_END_Y})`);
    console.log(`Arc center: (${arcCenterX}, ${arcCenterY})`);
    console.log(`Line 1: (${line1X}, ${line1Y})`);
    console.log(`Line 2: (${line2X}, ${line2Y})`);
    console.log(`Line 3: (${line3X}, ${line3Y})`);
    
    // Draw vertical line segments
    svg.push(`  <line x1="${line1X}" y1="${line1Y}" x2="${line1X}" y2="${line1Y - LINE_HEIGHT}" stroke="${VERTICAL_COLOR}" stroke-width="${STROKE_WIDTH}"/>`);
    svg.push(`  <line x1="${line2X}" y1="${line2Y}" x2="${line2X}" y2="${line2Y - LINE_HEIGHT}" stroke="${VERTICAL_COLOR}" stroke-width="${STROKE_WIDTH}"/>`);
    svg.push(`  <line x1="${line3X}" y1="${line3Y}" x2="${line3X}" y2="${line3Y - LINE_HEIGHT}" stroke="${VERTICAL_COLOR}" stroke-width="${STROKE_WIDTH}"/>`);
    
    // Draw radial lines extending away from circle center
    // Calculate direction vectors from center to each intersection point
    const radial1DeltaX = line1X - arcCenterX;
    const radial1DeltaY = line1Y - arcCenterY;
    const radial2DeltaX = line2X - arcCenterX;
    const radial2DeltaY = line2Y - arcCenterY;
    const radial3DeltaX = line3X - arcCenterX;
    const radial3DeltaY = line3Y - arcCenterY;
    
    // Normalize the direction vectors
    const radial1Distance = Math.sqrt(radial1DeltaX * radial1DeltaX + radial1DeltaY * radial1DeltaY);
    const radial2Distance = Math.sqrt(radial2DeltaX * radial2DeltaX + radial2DeltaY * radial2DeltaY);
    const radial3Distance = Math.sqrt(radial3DeltaX * radial3DeltaX + radial3DeltaY * radial3DeltaY);
    
    const radial1DirX = radial1DeltaX / radial1Distance;
    const radial1DirY = radial1DeltaY / radial1Distance;
    const radial2DirX = radial2DeltaX / radial2Distance;
    const radial2DirY = radial2DeltaY / radial2Distance;
    const radial3DirX = radial3DeltaX / radial3Distance;
    const radial3DirY = radial3DeltaY / radial3Distance;
    
    // Calculate end points for radial lines
    const radial1EndX = line1X + radial1DirX * RADIAL_LINE_LENGTH;
    const radial1EndY = line1Y + radial1DirY * RADIAL_LINE_LENGTH;
    const radial2EndX = line2X + radial2DirX * RADIAL_LINE_LENGTH;
    const radial2EndY = line2Y + radial2DirY * RADIAL_LINE_LENGTH;
    const radial3EndX = line3X + radial3DirX * RADIAL_LINE_LENGTH;
    const radial3EndY = line3Y + radial3DirY * RADIAL_LINE_LENGTH;
    
    // Draw radial lines
    svg.push(`  <line x1="${line1X}" y1="${line1Y}" x2="${radial1EndX}" y2="${radial1EndY}" stroke="${RADIAL_COLOR}" stroke-width="${STROKE_WIDTH}"/>`);
    svg.push(`  <line x1="${line2X}" y1="${line2Y}" x2="${radial2EndX}" y2="${radial2EndY}" stroke="${RADIAL_COLOR}" stroke-width="${STROKE_WIDTH}"/>`);
    svg.push(`  <line x1="${line3X}" y1="${line3Y}" x2="${radial3EndX}" y2="${radial3EndY}" stroke="${RADIAL_COLOR}" stroke-width="${STROKE_WIDTH}"/>`);
    
    // Draw pale orange lines from top of radial lines vertically down to arc
    // Calculate top points of radial lines (end points of black radial lines)
    const radialTop1X = radial1EndX;
    const radialTop1Y = radial1EndY;
    const radialTop2X = radial2EndX;
    const radialTop2Y = radial2EndY;
    const radialTop3X = radial3EndX;
    const radialTop3Y = radial3EndY;
    
    // Calculate top points of vertical lines for small arc calculations
    const top1X = line1X;
    const top1Y = line1Y - LINE_HEIGHT;
    const top2X = line2X;
    const top2Y = line2Y - LINE_HEIGHT;
    const top3X = line3X;
    const top3Y = line3Y - LINE_HEIGHT;
    
    // Calculate intersection points with the arc using vertical lines
    // For vertical lines: x = radialTopX, y = radialTopY - t (where t is distance down)
    // Circle equation: (radialTopX - arcCenterX)² + (radialTopY - t - arcCenterY)² = radius²
    // This gives: t² - 2*(radialTopY - arcCenterY)*t + (radialTopX - arcCenterX)² + (radialTopY - arcCenterY)² - radius² = 0
    
    // Line 1 intersection
    const paleA1 = 1;
    const paleB1 = -2 * (radialTop1Y - arcCenterY);
    const paleC1 = (radialTop1X - arcCenterX) * (radialTop1X - arcCenterX) + (radialTop1Y - arcCenterY) * (radialTop1Y - arcCenterY) - ARC_RADIUS * ARC_RADIUS;
    const paleDiscriminant1 = paleB1 * paleB1 - 4 * paleA1 * paleC1;
    const paleT1 = (-paleB1 + Math.sqrt(paleDiscriminant1)) / (2 * paleA1); // Use positive root for closer intersection when going down
    const pale1EndX = radialTop1X;
    const pale1EndY = radialTop1Y - paleT1;
    
    // Line 2 intersection
    const paleA2 = 1;
    const paleB2 = -2 * (radialTop2Y - arcCenterY);
    const paleC2 = (radialTop2X - arcCenterX) * (radialTop2X - arcCenterX) + (radialTop2Y - arcCenterY) * (radialTop2Y - arcCenterY) - ARC_RADIUS * ARC_RADIUS;
    const paleDiscriminant2 = paleB2 * paleB2 - 4 * paleA2 * paleC2;
    const paleT2 = (-paleB2 + Math.sqrt(paleDiscriminant2)) / (2 * paleA2);
    const pale2EndX = radialTop2X;
    const pale2EndY = radialTop2Y - paleT2;
    
    // Line 3 intersection
    const paleA3 = 1;
    const paleB3 = -2 * (radialTop3Y - arcCenterY);
    const paleC3 = (radialTop3X - arcCenterX) * (radialTop3X - arcCenterX) + (radialTop3Y - arcCenterY) * (radialTop3Y - arcCenterY) - ARC_RADIUS * ARC_RADIUS;
    const paleDiscriminant3 = paleB3 * paleB3 - 4 * paleA3 * paleC3;
    const paleT3 = (-paleB3 + Math.sqrt(paleDiscriminant3)) / (2 * paleA3);
    const pale3EndX = radialTop3X;
    const pale3EndY = radialTop3Y - paleT3;
    
    // Draw pale orange lines from top of radial lines vertically down to arc
    svg.push(`  <line x1="${radialTop1X}" y1="${radialTop1Y}" x2="${pale1EndX}" y2="${pale1EndY}" stroke="${PALE_ORANGE_COLOR}" stroke-width="${THIN_STROKE_WIDTH}"/>`);
    svg.push(`  <line x1="${radialTop2X}" y1="${radialTop2Y}" x2="${pale2EndX}" y2="${pale2EndY}" stroke="${PALE_ORANGE_COLOR}" stroke-width="${THIN_STROKE_WIDTH}"/>`);
    svg.push(`  <line x1="${radialTop3X}" y1="${radialTop3Y}" x2="${pale3EndX}" y2="${pale3EndY}" stroke="${PALE_ORANGE_COLOR}" stroke-width="${THIN_STROKE_WIDTH}"/>`);
    
    // Draw small pale blue circular arcs between radial and vertical lines
    // Each arc is centered at the intersection point with the large black arc
    // and has a radius of 35 pixels
    
    // Arc 1: between radial line 1 and vertical line 1
    const smallArc1CenterX = line1X;
    const smallArc1CenterY = line1Y;
    // Calculate start and end angles for the arc
    // Start angle: direction from center to top of vertical line
    const startAngle1 = Math.atan2(top1Y - smallArc1CenterY, top1X - smallArc1CenterX);
    // End angle: direction from center to end of radial line
    const endAngle1 = Math.atan2(radial1EndY - smallArc1CenterY, radial1EndX - smallArc1CenterX);
    // Convert to SVG arc format (degrees, 0-360)
    const startAngle1Deg = (startAngle1 * 180 / Math.PI + 360) % 360;
    const endAngle1Deg = (endAngle1 * 180 / Math.PI + 360) % 360;
    // Calculate arc parameters
    const largeArcFlag1 = Math.abs(endAngle1Deg - startAngle1Deg) > 180 ? 1 : 0;
    // Determine sweep direction based on angle difference
    const angleDiff1 = (endAngle1Deg - startAngle1Deg + 360) % 360;
    const sweepFlag1 = angleDiff1 > 180 ? 0 : 1; // 0 for counterclockwise, 1 for clockwise
    // Calculate start and end points
    const smallArc1StartX = smallArc1CenterX + SMALL_ARC_RADIUS * Math.cos(startAngle1);
    const smallArc1StartY = smallArc1CenterY + SMALL_ARC_RADIUS * Math.sin(startAngle1);
    const smallArc1EndX = smallArc1CenterX + SMALL_ARC_RADIUS * Math.cos(endAngle1);
    const smallArc1EndY = smallArc1CenterY + SMALL_ARC_RADIUS * Math.sin(endAngle1);
    // Create SVG path
    const smallArc1Path = `M ${smallArc1StartX} ${smallArc1StartY} A ${SMALL_ARC_RADIUS} ${SMALL_ARC_RADIUS} 0 ${largeArcFlag1} ${sweepFlag1} ${smallArc1EndX} ${smallArc1EndY}`;
    svg.push(`  <path d="${smallArc1Path}" fill="none" stroke="${PALE_BLUE_COLOR}" stroke-width="${THIN_STROKE_WIDTH}"/>`);
    
    // Arc 2: between radial line 2 and vertical line 2
    const smallArc2CenterX = line2X;
    const smallArc2CenterY = line2Y;
    const startAngle2 = Math.atan2(top2Y - smallArc2CenterY, top2X - smallArc2CenterX);
    const endAngle2 = Math.atan2(radial2EndY - smallArc2CenterY, radial2EndX - smallArc2CenterX);
    const startAngle2Deg = (startAngle2 * 180 / Math.PI + 360) % 360;
    const endAngle2Deg = (endAngle2 * 180 / Math.PI + 360) % 360;
    const largeArcFlag2 = Math.abs(endAngle2Deg - startAngle2Deg) > 180 ? 1 : 0;
    const angleDiff2 = (endAngle2Deg - startAngle2Deg + 360) % 360;
    const sweepFlag2 = angleDiff2 > 180 ? 0 : 1;
    const smallArc2StartX = smallArc2CenterX + SMALL_ARC_RADIUS * Math.cos(startAngle2);
    const smallArc2StartY = smallArc2CenterY + SMALL_ARC_RADIUS * Math.sin(startAngle2);
    const smallArc2EndX = smallArc2CenterX + SMALL_ARC_RADIUS * Math.cos(endAngle2);
    const smallArc2EndY = smallArc2CenterY + SMALL_ARC_RADIUS * Math.sin(endAngle2);
    const smallArc2Path = `M ${smallArc2StartX} ${smallArc2StartY} A ${SMALL_ARC_RADIUS} ${SMALL_ARC_RADIUS} 0 ${largeArcFlag2} ${sweepFlag2} ${smallArc2EndX} ${smallArc2EndY}`;
    svg.push(`  <path d="${smallArc2Path}" fill="none" stroke="${PALE_BLUE_COLOR}" stroke-width="${THIN_STROKE_WIDTH}"/>`);
    
    // Arc 3: between radial line 3 and vertical line 3
    const smallArc3CenterX = line3X;
    const smallArc3CenterY = line3Y;
    const startAngle3 = Math.atan2(top3Y - smallArc3CenterY, top3X - smallArc3CenterX);
    const endAngle3 = Math.atan2(radial3EndY - smallArc3CenterY, radial3EndX - smallArc3CenterX);
    const startAngle3Deg = (startAngle3 * 180 / Math.PI + 360) % 360;
    const endAngle3Deg = (endAngle3 * 180 / Math.PI + 360) % 360;
    const largeArcFlag3 = Math.abs(endAngle3Deg - startAngle3Deg) > 180 ? 1 : 0;
    const angleDiff3 = (endAngle3Deg - startAngle3Deg + 360) % 360;
    const sweepFlag3 = angleDiff3 > 180 ? 0 : 1;
    const smallArc3StartX = smallArc3CenterX + SMALL_ARC_RADIUS * Math.cos(startAngle3);
    const smallArc3StartY = smallArc3CenterY + SMALL_ARC_RADIUS * Math.sin(startAngle3);
    const smallArc3EndX = smallArc3CenterX + SMALL_ARC_RADIUS * Math.cos(endAngle3);
    const smallArc3EndY = smallArc3CenterY + SMALL_ARC_RADIUS * Math.sin(endAngle3);
    const smallArc3Path = `M ${smallArc3StartX} ${smallArc3StartY} A ${SMALL_ARC_RADIUS} ${SMALL_ARC_RADIUS} 0 ${largeArcFlag3} ${sweepFlag3} ${smallArc3EndX} ${smallArc3EndY}`;
    svg.push(`  <path d="${smallArc3Path}" fill="none" stroke="${PALE_BLUE_COLOR}" stroke-width="${THIN_STROKE_WIDTH}"/>`);
    
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
    console.log(`Diagram shows light direction with wide circular arc`);
}

/**
 * Main function
 */
async function main() {
    await generateLightDirectionSVG();
    console.log('Light direction generation complete!');
}

// Run the program
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateLightDirectionSVG }; 