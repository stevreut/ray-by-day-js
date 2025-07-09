const fs = require('fs');
const path = require('path');

// Output configuration
const OUTPUT_DIR = path.join(__dirname, '../../../tools-outputs/svg-graphics');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'seq17-vector-operations.svg');

// SVG configuration
const SVG_WIDTH = 1200;
const SVG_HEIGHT = 900;
const MARGIN = 80;
const GRID_SIZE = 60;
const ARROW_HEAD_SIZE = 8;

// Colors
const BACKGROUND_COLOR = '#FFFFFF';
const GRID_COLOR = '#E0E0E0';
const AXIS_COLOR = '#404040';
const VECTOR_COLOR = '#0066CC';
const VECTOR_B_COLOR = '#CC6600';
const RESULT_COLOR = '#00AA00';
const TEXT_COLOR = '#202020';

/**
 * Generate SVG for vector operations diagrams
 */
function generateVectorOperationsSVG() {
    console.log('=== Running: vector-operations-17.js ===');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    const svg = [];
    svg.push('<?xml version="1.0" encoding="UTF-8"?>');
    svg.push(`<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">`);
    
    // Define arrowhead markers
    svg.push('  <defs>');
    svg.push('    <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">');
    svg.push('      <polygon points="0 0, 5 1.75, 0 3.5" fill="currentColor"/>');
    svg.push('    </marker>');
    svg.push(`    <marker id="arrowhead-blue" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">`);
    svg.push(`      <polygon points="0 0, 5 1.75, 0 3.5" fill="${VECTOR_COLOR}"/>`);
    svg.push('    </marker>');
    svg.push(`    <marker id="arrowhead-red" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">`);
    svg.push(`      <polygon points="0 0, 5 1.75, 0 3.5" fill="${VECTOR_B_COLOR}"/>`);
    svg.push('    </marker>');
    svg.push(`    <marker id="arrowhead-green" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">`);
    svg.push(`      <polygon points="0 0, 5 1.75, 0 3.5" fill="${RESULT_COLOR}"/>`);
    svg.push('    </marker>');
    svg.push('  </defs>');
    
    // Background
    svg.push(`  <rect x="0" y="0" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="${BACKGROUND_COLOR}"/>`);
    
    // Draw coordinate grid
    drawGrid(svg);
    
    // Draw coordinate axes
    drawAxes(svg);
    
    // Draw vector A (3, 2)
    const vectorA = { x: 3, y: 2 };
    drawVector(svg, 0, 0, vectorA.x, vectorA.y, VECTOR_COLOR, 'A', 'A = 3i + 2j');
    
    // Draw vector B (1, 3)
    const vectorB = { x: 1, y: 3 };
    drawVector(svg, 0, 0, vectorB.x, vectorB.y, VECTOR_B_COLOR, 'B', 'B = 1i + 3j');
    
    // Draw vector addition A + B
    const sumVector = { x: vectorA.x + vectorB.x, y: vectorA.y + vectorB.y };
    drawVector(svg, 0, 0, sumVector.x, sumVector.y, RESULT_COLOR, 'A+B', 'A+B = 4i + 5j');
    
    // Draw parallelogram construction
    drawParallelogram(svg, vectorA, vectorB);
    
    // Add title and explanation
    addTitle(svg, 'Vector Addition: A + B');
    addExplanation(svg, 'Geometric: Parallelogram method', 'Numerical: Component-wise addition');
    
    svg.push('</svg>');
    
    // Write SVG file
    fs.writeFileSync(OUTPUT_FILE, svg.join('\n'));
    
    console.log(`SVG generated successfully: ${OUTPUT_FILE}`);
    console.log(`Diagram shows vector addition with geometric and numerical aspects`);
    console.log(`Vector A: 3i + 2j, Vector B: 1i + 3j, Result: 4i + 5j`);
}

/**
 * Draw coordinate grid
 */
function drawGrid(svg) {
    const gridStart = MARGIN;
    const gridEnd = SVG_WIDTH - MARGIN;
    const gridHeight = SVG_HEIGHT - 2 * MARGIN;
    
    // Vertical grid lines
    for (let x = gridStart; x <= gridEnd; x += GRID_SIZE) {
        svg.push(`  <line x1="${x}" y1="${MARGIN}" x2="${x}" y2="${SVG_HEIGHT - MARGIN}" stroke="${GRID_COLOR}" stroke-width="1"/>`);
    }
    
    // Horizontal grid lines
    for (let y = MARGIN; y <= SVG_HEIGHT - MARGIN; y += GRID_SIZE) {
        svg.push(`  <line x1="${gridStart}" y1="${y}" x2="${gridEnd}" y2="${y}" stroke="${GRID_COLOR}" stroke-width="1"/>`);
    }
}

/**
 * Draw coordinate axes
 */
function drawAxes(svg) {
    const centerX = SVG_WIDTH / 2;
    const centerY = SVG_HEIGHT / 2;
    
    // X-axis
    svg.push(`  <line x1="${MARGIN}" y1="${centerY}" x2="${SVG_WIDTH - MARGIN}" y2="${centerY}" stroke="${AXIS_COLOR}" stroke-width="2"/>`);
    
    // Y-axis
    svg.push(`  <line x1="${centerX}" y1="${MARGIN}" x2="${centerX}" y2="${SVG_HEIGHT - MARGIN}" stroke="${AXIS_COLOR}" stroke-width="2"/>`);
    
    // Axis labels
    svg.push(`  <text x="${SVG_WIDTH - MARGIN + 20}" y="${centerY + 5}" font-family="Arial" font-size="16" fill="${AXIS_COLOR}">x</text>`);
    svg.push(`  <text x="${centerX - 5}" y="${MARGIN - 10}" font-family="Arial" font-size="16" fill="${AXIS_COLOR}">y</text>`);
}

/**
 * Draw a vector with arrow and label
 */
function drawVector(svg, startX, startY, endX, endY, color, label, coords) {
    const centerX = SVG_WIDTH / 2;
    const centerY = SVG_HEIGHT / 2;
    const scale = GRID_SIZE;
    
    const x1 = centerX + startX * scale;
    const y1 = centerY - startY * scale;
    const x2 = centerX + endX * scale;
    const y2 = centerY - endY * scale;
    
    // Determine which marker to use based on color
    let markerId = 'arrowhead';
    if (color === VECTOR_COLOR) markerId = 'arrowhead-blue';
    else if (color === VECTOR_B_COLOR) markerId = 'arrowhead-red';
    else if (color === RESULT_COLOR) markerId = 'arrowhead-green';
    
    // Vector line with marker
    svg.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" marker-end="url(#${markerId})"/>`);
    
    // Vector label
    const labelX = x2 + 10;
    const labelY = y2 - 10;
    svg.push(`  <text x="${labelX}" y="${labelY}" font-family="Arial" font-size="14" font-weight="bold" fill="${color}">${label}</text>`);
    
    // Coordinates with unit vector notation
    if (coords) {
        // Parse the coordinate string more carefully
        const match = coords.match(/(\w+)\s*=\s*(\d+)([ij])\s*\+\s*(\d+)([ij])/);
        if (match) {
            const [, label, x1, i1, y1, j1] = match;
            let currentX = labelX;
            
            // Label (A, B, A+B)
            svg.push(`  <text x="${currentX}" y="${labelY + 20}" font-family="Arial" font-size="12" fill="${TEXT_COLOR}">${label}</text>`);
            currentX += label.length * 7 + 5; // Add extra spacing after label
            
            // Equals sign
            svg.push(`  <text x="${currentX}" y="${labelY + 20}" font-family="Arial" font-size="12" fill="${TEXT_COLOR}"> = </text>`);
            currentX += 15;
            
            // First number
            svg.push(`  <text x="${currentX}" y="${labelY + 20}" font-family="Arial" font-size="12" fill="${TEXT_COLOR}">${x1}</text>`);
            currentX += x1.length * 7;
            
            // First unit vector
            svg.push(`  <text x="${currentX}" y="${labelY + 20}" font-family="Arial" font-size="12" font-weight="bold" fill="${TEXT_COLOR}">${i1}</text>`);
            currentX += 8;
            
            // Plus sign with minimal spacing
            svg.push(`  <text x="${currentX}" y="${labelY + 20}" font-family="Arial" font-size="12" fill="${TEXT_COLOR}">+</text>`);
            currentX += 8;
            
            // Second number
            svg.push(`  <text x="${currentX}" y="${labelY + 20}" font-family="Arial" font-size="12" fill="${TEXT_COLOR}">${y1}</text>`);
            currentX += y1.length * 7;
            
            // Second unit vector
            svg.push(`  <text x="${currentX}" y="${labelY + 20}" font-family="Arial" font-size="12" font-weight="bold" fill="${TEXT_COLOR}">${j1}</text>`);
        }
    }
}

/**
 * Draw parallelogram construction for vector addition
 */
function drawParallelogram(svg, vectorA, vectorB) {
    const centerX = SVG_WIDTH / 2;
    const centerY = SVG_HEIGHT / 2;
    const scale = GRID_SIZE;
    
    // Draw dashed lines to show parallelogram construction
    const dashArray = "5,5";
    
    // Line from tip of A to tip of A+B
    const x1 = centerX + vectorA.x * scale;
    const y1 = centerY - vectorA.y * scale;
    const x2 = centerX + (vectorA.x + vectorB.x) * scale;
    const y2 = centerY - (vectorA.y + vectorB.y) * scale;
    svg.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${VECTOR_B_COLOR}" stroke-width="2" stroke-dasharray="${dashArray}"/>`);
    
    // Line from tip of B to tip of A+B
    const x3 = centerX + vectorB.x * scale;
    const y3 = centerY - vectorB.y * scale;
    svg.push(`  <line x1="${x3}" y1="${y3}" x2="${x2}" y2="${y2}" stroke="${VECTOR_COLOR}" stroke-width="2" stroke-dasharray="${dashArray}"/>`);
}

/**
 * Add title to the diagram
 */
function addTitle(svg, title) {
    svg.push(`  <text x="${SVG_WIDTH/2}" y="40" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="${TEXT_COLOR}">${title}</text>`);
}

/**
 * Add explanation text
 */
function addExplanation(svg, geometric, numerical) {
    svg.push(`  <text x="${MARGIN}" y="${SVG_HEIGHT - 60}" font-family="Arial" font-size="14" fill="${TEXT_COLOR}">Geometric: ${geometric}</text>`);
    svg.push(`  <text x="${MARGIN}" y="${SVG_HEIGHT - 40}" font-family="Arial" font-size="14" fill="${TEXT_COLOR}">Numerical: ${numerical}</text>`);
}

// Run the program
if (require.main === module) {
    generateVectorOperationsSVG();
}

module.exports = { generateVectorOperationsSVG }; 