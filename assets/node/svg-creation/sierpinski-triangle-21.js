const fs = require('fs');
const sharp = require('sharp');

// Empty program - ready for specifications

const COLOR = '#229922';

// Initial values for the main triangle
const XINIT = 300;  // Half of width (600/2)
const YINIT = 75;
const SIDEINIT = 500;
const LEVELINIT = 7;

const SQRT3HALF = Math.sqrt(3) / 2;

function createEquilateralTriangle(x, y, side) {
    // Calculate the other two vertices of the equilateral triangle
    const height = side * SQRT3HALF;
    const leftX = x - side / 2;
    const leftY = y + height;
    const rightX = x + side / 2;
    const rightY = y + height;
    
    return `<polygon points="${x},${y} ${leftX},${leftY} ${rightX},${rightY}" fill="${COLOR}"/>`;
}

function spt(x, y, side, level) {
    if (level <= 0) {
        return createEquilateralTriangle(x, y, side);
    } else {
        const newLevel = level - 1;
        const newSide = side / 2;
        const xOffset = newSide / 2;
        const vOffset = newSide * SQRT3HALF;
        
        // TODO: Add three recursive calls with appropriate x, y parameters
        return spt(x, y, newSide, newLevel) +
               spt(x - xOffset, y + vOffset, newSide, newLevel) +
               spt(x + xOffset, y + vOffset, newSide, newLevel);
    }   
}

// Test the function with a single triangle
const width = 600;
const height = 600;
let x = XINIT;  // Center horizontally
let y = YINIT;  // Near the top
let side = SIDEINIT;  // Large enough to fill most of the image

// Generate 7 pairs of files (levels 0-6)
for (let index = 0; index <= 6; index++) {
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="white"/>
    ${spt(XINIT, YINIT, SIDEINIT, index)}
</svg>`;

    // Save the SVG file
    const svgPath = `../../../tools-outputs/svg-graphics/seq21-sierpinski-triangle-${index}.svg`;
    fs.writeFileSync(svgPath, svgContent);
    console.log(`SVG saved to: ${svgPath}`);

    // Convert SVG to PNG
    const pngPath = `../../../tools-outputs/svg-graphics/seq21-sierpinski-triangle-${index}.png`;
    sharp(Buffer.from(svgContent))
        .png()
        .toFile(pngPath)
        .then(() => {
            console.log(`PNG saved to: ${pngPath}`);
        })
        .catch((err) => {
            console.error(`Error converting to PNG for index ${index}:`, err);
        });
} 