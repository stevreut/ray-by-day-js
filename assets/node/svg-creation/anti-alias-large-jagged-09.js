const fs = require('fs');
const path = require('path');

// Constants
const SQUARE_SIZE = 30;
const BORDER_WIDTH = 5;
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;
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

    // Generate squares
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const xPos = x * SQUARE_SIZE;
            const yPos = y * SQUARE_SIZE;
            
            // Calculate color based on rule
            const r2 = x * x + y * y;
            const fillColor = r2 > THRESHOLD ? WHITE_COLOR : BLUE_COLOR;
            
            // Create square with border
            svgContent += `  <rect x="${xPos}" y="${yPos}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" 
    fill="${fillColor}"/>
`;
        }
    }

    svgContent += '</svg>';

    return svgContent;
}

function main() {
    try {
        const svgContent = generateSVG();
        const outputPath = path.join(__dirname, '../../../tools-outputs/svg-graphics/anti-alias-large-jagged-09.svg');
        
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