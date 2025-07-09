const fs = require('fs');
const path = require('path');

// Constants for green bar paper simulation
// Calculate proper dimensions for 132 columns and 66 rows
const CHARACTER_WIDTH_PIXELS = 10; // 10px per character
const TEXT_START_X = 50; // Start text after sprocket holes
const TEXT_START_Y = 0; // Start text at the very top of the page
const TEXT_END_MARGIN = 50; // End margin for text

// Calculate required paper dimensions
const REQUIRED_TEXT_WIDTH = 132 * CHARACTER_WIDTH_PIXELS; // 1320px for text
const PAPER_WIDTH = TEXT_START_X + REQUIRED_TEXT_WIDTH + TEXT_END_MARGIN; // 1420px total

// Calculate line height to ensure exactly 3 lines per stripe
// We want 22 stripes (66 lines / 3 lines per stripe)
// Let's set a reasonable line height and calculate paper height
const LINE_HEIGHT_PIXELS = 16; // 16px per line
const REQUIRED_TEXT_HEIGHT = 66 * LINE_HEIGHT_PIXELS; // 1056px for 66 lines
const PAPER_HEIGHT = REQUIRED_TEXT_HEIGHT; // Height exactly fits 66 lines
const STRIPE_HEIGHT = PAPER_HEIGHT / 22; // 48px per stripe (1056 / 22)
const PALE_GREEN_COLOR = '#e8f5e8'; // Pale green color for stripes
const WHITE_COLOR = '#ffffff'; // White color for stripes
const BORDER_WIDTH = 1;
const BORDER_COLOR = '#cccccc';

// Sprocket hole constants
const SPROCKET_RADIUS = 3;
const SPROCKET_COLOR = '#000000';
const LEFT_SPROCKET_X = 15;
const RIGHT_SPROCKET_X = PAPER_WIDTH - 15;

// Text positioning constants (traditional green bar paper specs)
const CHARACTERS_PER_INCH_HORIZONTAL = 10;
const LINES_PER_INCH_VERTICAL = 6;
const PAPER_WIDTH_INCHES = PAPER_WIDTH / 100; // Convert to inches
const PAPER_HEIGHT_INCHES = PAPER_HEIGHT / 100; // Convert to inches
const TEXT_COLOR = '#000000';
const FONT_FAMILY = 'Courier';
const FONT_SIZE = 12;

// Ink level constants for realistic printout appearance
const LO_INK = 20;
const HI_INK = 130;

// COBOL source code for 99 bottles of beer song
const COBOL_99_BOTTLES = `000100       IDENTIFICATION DIVISION.
000200       PROGRAM-ID. NINETY-NINE-BOTTLES.
000300       AUTHOR. S. REUTERSKIOLD 10% / CURSOR 90%.
000400       DATE-WRITTEN. 2025-07-08.
000500       ENVIRONMENT DIVISION.
000600       DATA DIVISION.
000700       WORKING-STORAGE SECTION.
000800           01 BOTTLE-COUNT PIC 99 VALUE 99.
000900           01 BOTTLE-WORD PIC X(8).
001000           01 BOTTLE-WORD-2 PIC X(8).
001100           01 VERSE-LINE-1 PIC X(80).
001200           01 VERSE-LINE-2 PIC X(80).
001300           01 VERSE-LINE-3 PIC X(80).
001400           01 VERSE-LINE-4 PIC X(80).
001500           01 TEMP-COUNT PIC 99.
001600       PROCEDURE DIVISION.
001700       MAIN-LOGIC.
001800           PERFORM UNTIL BOTTLE-COUNT = 0
001900               MOVE BOTTLE-COUNT TO TEMP-COUNT
002000               IF BOTTLE-COUNT = 1
002100                   MOVE "bottle" TO BOTTLE-WORD
002200                   MOVE "bottles" TO BOTTLE-WORD-2
002300               ELSE
002400                   MOVE "bottles" TO BOTTLE-WORD
002500                   MOVE "bottles" TO BOTTLE-WORD-2
002600               END-IF.
002700               STRING TEMP-COUNT DELIMITED BY SIZE
002800                      SPACE DELIMITED BY SIZE
002900                      BOTTLE-WORD DELIMITED BY SPACE
003000                      " of beer on the wall,"
003100                      DELIMITED BY SIZE
003200                      INTO VERSE-LINE-1.
003300               STRING TEMP-COUNT DELIMITED BY SIZE
003400                      SPACE DELIMITED BY SIZE
003500                      BOTTLE-WORD DELIMITED BY SPACE
003600                      " of beer."
003700                      DELIMITED BY SIZE
003800                      INTO VERSE-LINE-2.
003900               SUBTRACT 1 FROM BOTTLE-COUNT.
004000               IF BOTTLE-COUNT = 0
004100                   MOVE "no more" TO VERSE-LINE-3
004200                   MOVE "bottles" TO BOTTLE-WORD-2
004300               ELSE
004400                   MOVE BOTTLE-COUNT TO VERSE-LINE-3
004500               END-IF.
004600               STRING "Take one down and pass it around, "
004700                      DELIMITED BY SIZE
004800                      VERSE-LINE-3 DELIMITED BY SPACE
004900                      SPACE DELIMITED BY SIZE
005000                      BOTTLE-WORD-2 DELIMITED BY SPACE
005100                      " of beer on the wall."
005200                      DELIMITED BY SIZE
005300                      INTO VERSE-LINE-4.
005400               DISPLAY VERSE-LINE-1.
005500               DISPLAY VERSE-LINE-2.
005600               DISPLAY VERSE-LINE-4.
005700               DISPLAY " ".
005800           END-PERFORM.
005900           DISPLAY "No more bottles of beer on the wall,".
006000           DISPLAY "no more bottles of beer.".
006100           DISPLAY "Go to the store and buy some more,".
006200           DISPLAY "99 bottles of beer on the wall.".
006300           STOP RUN.`;

// Function to place a character at a specific position
function placeCharacter(svgContent, character, xPosition, yPosition) {
    const x = TEXT_START_X + (xPosition * CHARACTER_WIDTH_PIXELS);
    // Position text to align with the top of each line within the stripe
    const y = TEXT_START_Y + (yPosition * LINE_HEIGHT_PIXELS) + (LINE_HEIGHT_PIXELS * 0.75); // Adjust for text baseline
    
    // Generate random ink level and convert to hex color
    const inkLevel = Math.floor(Math.random() * (HI_INK - LO_INK + 1)) + LO_INK;
    const hexValue = inkLevel.toString(16).padStart(2, '0');
    const inkColor = `#${hexValue}${hexValue}${hexValue}`;
    
    return svgContent + `  <text x="${x}" y="${y}" font-family="${FONT_FAMILY}" font-size="${FONT_SIZE}" fill="${inkColor}">${character}</text>
`;
}

function generateSVG() {
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${PAPER_WIDTH}" height="${PAPER_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
`;

  // Generate alternating pale green and white stripes
  // Each stripe is 3 lines tall (66 lines total = 22 stripes)
  for (let stripe = 0; stripe < 22; stripe++) {
    const yPos = stripe * STRIPE_HEIGHT;
    const isGreenStripe = stripe % 2 === 0;
    const fillColor = isGreenStripe ? PALE_GREEN_COLOR : WHITE_COLOR;
    
    // Create stripe rectangle
    svgContent += `  <rect x="0" y="${yPos}" width="${PAPER_WIDTH}" height="${STRIPE_HEIGHT}" 
    fill="${fillColor}" stroke="${BORDER_COLOR}" stroke-width="${BORDER_WIDTH}"/>
`;
  }

  // Generate sprocket holes on left and right edges
  // 3 holes per stripe, evenly spaced within each stripe
  for (let stripe = 0; stripe < 22; stripe++) {
    const stripeY = stripe * STRIPE_HEIGHT;
    
    // Add 3 sprocket holes per stripe
    for (let hole = 0; hole < 3; hole++) {
      const holeY = stripeY + (hole + 0.5) * (STRIPE_HEIGHT / 3);
      
      // Left sprocket hole
      svgContent += `  <circle cx="${LEFT_SPROCKET_X}" cy="${holeY}" r="${SPROCKET_RADIUS}" 
    fill="${SPROCKET_COLOR}"/>
`;
      
      // Right sprocket hole
      svgContent += `  <circle cx="${RIGHT_SPROCKET_X}" cy="${holeY}" r="${SPROCKET_RADIUS}" 
    fill="${SPROCKET_COLOR}"/>
`;
    }
  }

  // Add text positioning information as comments in the SVG
  svgContent += `  <!-- Text positioning grid for COBOL program output -->
  <!-- Character width: ${CHARACTER_WIDTH_PIXELS}px, Line height: ${LINE_HEIGHT_PIXELS}px -->
  <!-- Traditional specs: ${CHARACTERS_PER_INCH_HORIZONTAL} chars/inch horizontal, ${LINES_PER_INCH_VERTICAL} lines/inch vertical -->
`;

  // Split COBOL source into lines and render first 66 lines
  const cobolLines = COBOL_99_BOTTLES.split('\n');
  
  for (let row = 0; row < Math.min(66, cobolLines.length); row++) {
    const line = cobolLines[row];
    const maxChars = Math.min(132, line.length);
    
    for (let col = 0; col < maxChars; col++) {
      const character = line[col];
      svgContent = placeCharacter(svgContent, character, col, row);
    }
  }

  svgContent += '</svg>';
  
  return svgContent;
}

function main() {
    try {
        const svgContent = generateSVG();
        const outputPath = path.join(__dirname, '../../../tools-outputs/svg-graphics/seq16-cobol.svg');
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, svgContent);
        console.log(`SVG generated successfully: ${outputPath}`);
        console.log(`Paper dimensions: ${PAPER_WIDTH} x ${PAPER_HEIGHT} pixels`);
        console.log(`Stripe height: ${STRIPE_HEIGHT} pixels (3 lines each)`);
        console.log(`Total stripes: 22 (11 green, 11 white)`);
        console.log(`Sprocket holes: 3 per stripe, 66 total per side`);
        console.log(`Text specs: ${CHARACTERS_PER_INCH_HORIZONTAL} chars/inch horizontal, ${LINES_PER_INCH_VERTICAL} lines/inch vertical`);
        console.log(`Character width: ${CHARACTER_WIDTH_PIXELS}px, Line height: ${LINE_HEIGHT_PIXELS}px`);
        console.log(`Text area: ${Math.floor((PAPER_WIDTH - TEXT_START_X - 50) / CHARACTER_WIDTH_PIXELS)} chars × ${Math.floor((PAPER_HEIGHT - TEXT_START_Y - 30) / LINE_HEIGHT_PIXELS)} lines`);
        console.log(`Ink levels: ${LO_INK}-${HI_INK} (random gray shades for realistic printout)`);
        
    } catch (error) {
        console.error('Error generating SVG:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { generateSVG, placeCharacter, PAPER_WIDTH, PAPER_HEIGHT, STRIPE_HEIGHT, CHARACTER_WIDTH_PIXELS, LINE_HEIGHT_PIXELS, LO_INK, HI_INK };