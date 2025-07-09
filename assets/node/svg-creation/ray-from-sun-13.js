const fs = require('fs');
const path = require('path');

// Constants
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
const RAY_COLOR = "#fff8c0";
const RAY_WIDTH = 1;

function generateSVG() {
    // Sun position in upper right - moved further from borders
    const sunX = 700;
    const sunY = 100;
    const sunRadius = 30;
    const rayLength = 20;
    const strokeWidth = 4; // Thicker stroke for both circle and lines
    
    // Eye position in lower left - about as far from corner as sun
    const eyeX = 100;
    const eyeY = 500;
    const eyeWidth = 40;
    const eyeHeight = 25;
    
    // Function to draw a light ray with triangular tip
    function drawLightRay(startX, startY, endX, endY) {
        return `
    <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${RAY_COLOR}" stroke-width="${RAY_WIDTH}"/>`;
    }
    
    // Function to draw a ray from sun to any endpoint (automatically calculates proper direction)
    function drawRayFromSunTo(endX, endY) {
        // Calculate direction from sun center to endpoint
        const dx = endX - sunX;
        const dy = endY - sunY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const unitX = dx / distance;
        const unitY = dy / distance;
        
        // Start point is 15 pixels beyond sun's radial lines in the direction of the endpoint
        const startX = sunX + unitX * (sunRadius + rayLength + 15);
        const startY = sunY + unitY * (sunRadius + rayLength + 15);
        
        return drawLightRay(startX, startY, endX, endY);
    }
    
    // Calculate 10 radial lines at 36-degree intervals
    const radialLines = [];
    for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5; // 36 degrees = π/5 radians
        const startX = sunX + Math.cos(angle) * sunRadius;
        const startY = sunY + Math.sin(angle) * sunRadius;
        const endX = sunX + Math.cos(angle) * (sunRadius + rayLength);
        const endY = sunY + Math.sin(angle) * (sunRadius + rayLength);
        radialLines.push({ startX, startY, endX, endY });
    }
    
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SVG_WIDTH}" height="${SVG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="black"/>
  <!-- Sun as yellow circle with transparent fill -->
  <circle cx="${sunX}" cy="${sunY}" r="${sunRadius}" fill="none" stroke="#ffff00" stroke-width="${strokeWidth}"/>
  
  <!-- 10 radial line segments with rounded caps -->
  <g stroke="#ffff00" stroke-width="${strokeWidth}" stroke-linecap="round">`;
    
    radialLines.forEach(line => {
        svgContent += `
    <line x1="${line.startX}" y1="${line.startY}" x2="${line.endX}" y2="${line.endY}"/>`;
    });
    
    svgContent += `
  </g>
  
  <!-- Blue circles (same size as sun, no radial lines) -->
  <circle cx="400" cy="200" r="${sunRadius}" fill="none" stroke="#0080ff" stroke-width="${strokeWidth}"/>
  <circle cx="600" cy="400" r="${sunRadius}" fill="none" stroke="#00ffff" stroke-width="${strokeWidth}"/>
  <circle cx="300" cy="350" r="${sunRadius}" fill="none" stroke="#8000ff" stroke-width="${strokeWidth}"/>
  
  <!-- Ray from sun toward left edge -->
  ${drawRayFromSunTo(50, sunY)}
  
  <!-- Two connected rays: sun -> cyan circle -> eye -->
  ${drawRayFromSunTo(600 - sunRadius * 0.7, 400 - sunRadius * 0.7)}
  ${drawLightRay(600 - sunRadius * 0.7, 400 - sunRadius * 0.7, eyeX + eyeWidth/2 + 15, eyeY)}
  
  <!-- Three connected rays: sun -> purple circle -> purple circle -> eye -->
  ${drawRayFromSunTo(300 + sunRadius * 0.7, 350 - sunRadius * 0.7)}
  ${drawLightRay(300 + sunRadius * 0.7, 350 - sunRadius * 0.7, 300 - sunRadius * 0.7, 350 + sunRadius * 0.3)}
  ${drawLightRay(300 - sunRadius * 0.7, 350 + sunRadius * 0.3, eyeX + eyeWidth/2 + 15, eyeY - 20)}
  
  <!-- Two pairs of rays that emanate from sun, contact circles, then proceed randomly -->
  <!-- First pair: sun -> blue circle -> random direction -->
  ${drawRayFromSunTo(400 + sunRadius * 0.8, 200 - sunRadius * 0.8)}
  ${drawLightRay(400 + sunRadius * 0.8, 200 - sunRadius * 0.8, 400 + sunRadius * 8.0, 200 - sunRadius * 9.0)}
  
  <!-- Second pair: sun -> cyan circle -> random direction -->
  ${drawRayFromSunTo(600 - sunRadius * 0.6, 400 + sunRadius * 0.6)}
  ${drawLightRay(600 - sunRadius * 0.6, 400 + sunRadius * 0.6, 600 - sunRadius * 10.0, 400 + sunRadius * 6.0)}
  
  <!-- Schematic eye in lower left -->
  <g stroke="#809080" stroke-width="2" fill="none" transform="translate(${eyeX} ${eyeY}) rotate(-20) scale(1.5) translate(-${eyeX} -${eyeY})">
    <!-- Upper eyelid - curves slightly down and joins lower eyelid on left -->
    <path d="M ${eyeX - eyeWidth/2} ${eyeY} Q ${eyeX} ${eyeY - eyeHeight/12} ${eyeX + eyeWidth/3} ${eyeY - eyeHeight/4}"/>
    <!-- Lower eyelid - curves slightly up and joins upper eyelid on left -->
    <path d="M ${eyeX - eyeWidth/2} ${eyeY} Q ${eyeX} ${eyeY + eyeHeight/12} ${eyeX + eyeWidth/3} ${eyeY + eyeHeight/4}"/>
    <!-- Convex arc on right side connecting the two eyelid arcs - starts further left and meets precisely -->
    <path d="M ${eyeX + eyeWidth/5} ${eyeY - eyeHeight/4} Q ${eyeX + eyeWidth/3} ${eyeY} ${eyeX + eyeWidth/5} ${eyeY + eyeHeight/4}"/>
  </g>
  
  <!-- Thick white line segment near the eye -->
  <line x1="${eyeX + eyeWidth/2 + 25}" y1="${eyeY - 80}" x2="${eyeX + eyeWidth/2 + 65}" y2="${eyeY + 40}" stroke="white" stroke-width="${strokeWidth + 2}"/>
</svg>`;

    return svgContent;
}

function main() {
    try {
        const svgContent = generateSVG();
        
        // Ensure output directory exists
        const outputDir = path.join(__dirname, '../../../tools-outputs/svg-graphics');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write SVG file
        const outputPath = path.join(outputDir, 'ray-from-sun-13.svg');
        fs.writeFileSync(outputPath, svgContent);
        
        console.log(`SVG generated successfully: ${outputPath}`);
        console.log('Sun and schematic eye created');
        
    } catch (error) {
        console.error('Error generating SVG:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
} 