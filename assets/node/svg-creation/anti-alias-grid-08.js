const fs = require('fs');
const path = require('path');

// Constants
const SQUARE_SIZE = 150;
const BORDER_WIDTH = 5;
const GRID_WIDTH = 8;
const GRID_HEIGHT = 6;
const BORDER_COLOR = '#ff9900';
const WHITE_COLOR = '#fff8dc';
const BLUE_COLOR = '#0080ff';
const THRESHOLD = 625;

// Calculate overall SVG dimensions
const SVG_WIDTH = GRID_WIDTH * SQUARE_SIZE;
const SVG_HEIGHT = GRID_HEIGHT * SQUARE_SIZE;

function generateSVG() {
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
`;

    const SMALL_SQUARE_SIZE = SQUARE_SIZE / 3;
    const SMALL_BORDER_WIDTH = 0; // no fine grid lines
    const SMALL_BORDER_COLOR = '#666666'; // gray, same as subdivision lines in -03.svg

    // First pass: calculate average colors for each 3x3 group
    const groupColors = [];
    for (let bigY = 0; bigY < GRID_HEIGHT; bigY++) {
        groupColors[bigY] = [];
        for (let bigX = 0; bigX < GRID_WIDTH; bigX++) {
            let blueCount = 0;
            let whiteCount = 0;
            
            // Count colors in this 3x3 group
            for (let smallY = 0; smallY < 3; smallY++) {
                for (let smallX = 0; smallX < 3; smallX++) {
                    const x = bigX * 3 + smallX;
                    const y = bigY * 3 + smallY;
                    const r2 = (x * x + y * y) * 25 / 9;
                    if (r2 > THRESHOLD) {
                        whiteCount++;
                    } else {
                        blueCount++;
                    }
                }
            }
            
            // Calculate average color based on proportions
            const totalSquares = 9;
            const blueRatio = blueCount / totalSquares;
            const whiteRatio = whiteCount / totalSquares;
            
            // Interpolate between blue and white based on proportions
            const blueR = 0, blueG = 128, blueB = 255; // #0080ff
            const whiteR = 255, whiteG = 248, whiteB = 220; // #fff8dc (cream)
            
            const avgR = Math.round(blueR * blueRatio + whiteR * whiteRatio);
            const avgG = Math.round(blueG * blueRatio + whiteG * whiteRatio);
            const avgB = Math.round(blueB * blueRatio + whiteB * whiteRatio);
            
            groupColors[bigY][bigX] = `rgb(${avgR}, ${avgG}, ${avgB})`;
        }
    }

    // Second pass: generate squares with average colors
    for (let bigY = 0; bigY < GRID_HEIGHT; bigY++) {
        for (let bigX = 0; bigX < GRID_WIDTH; bigX++) {
            const avgColor = groupColors[bigY][bigX];
            
            // Create single large square with the average color
            const xPos = bigX * SQUARE_SIZE;
            const yPos = bigY * SQUARE_SIZE;
            
            svgContent += `  <rect x="${xPos}" y="${yPos}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" 
    fill="${avgColor}"/>
`;
        }
    }

    svgContent += '</svg>';

    return svgContent;
}

function main() {
    try {
        const svgContent = generateSVG();
        const outputPath = path.join(__dirname, '../../../tools-outputs/svg-graphics/seq08-anti-alias-grid.svg');
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, svgContent);
        console.log(`SVG generated successfully: ${outputPath}`);
        console.log(`Grid dimensions: ${GRID_WIDTH} x ${GRID_HEIGHT} squares`);
        console.log(`Total SVG size: ${SVG_WIDTH} x ${SVG_HEIGHT} pixels`);
        
    } catch (error) {
        console.error('Error generating SVG:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateSVG, SQUARE_SIZE, BORDER_WIDTH, GRID_WIDTH, GRID_HEIGHT }; 