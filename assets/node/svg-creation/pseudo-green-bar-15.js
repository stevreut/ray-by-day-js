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

// Character weight table for realistic ink level variation
const CHARACTER_WEIGHTS = [
  // Lightest characters (minimal coverage)
  { char: " ", charNum: 32, weight: 0 },      // Space
  { char: ".", charNum: 46, weight: 5 },      // Period
  { char: "'", charNum: 39, weight: 8 },      // Single quote
  { char: "`", charNum: 96, weight: 8 },      // Backtick
  { char: ",", charNum: 44, weight: 10 },     // Comma
  { char: ":", charNum: 58, weight: 12 },     // Colon
  { char: ";", charNum: 59, weight: 15 },     // Semicolon
  { char: "!", charNum: 33, weight: 15 },     // Exclamation
  { char: "i", charNum: 105, weight: 18 },    // Lowercase i
  { char: "l", charNum: 108, weight: 20 },    // Lowercase l
  { char: "I", charNum: 73, weight: 25 },     // Uppercase I
  { char: "1", charNum: 49, weight: 25 },     // Digit 1
  { char: "|", charNum: 124, weight: 25 },    // Vertical bar
  { char: "f", charNum: 102, weight: 30 },    // Lowercase f
  { char: "t", charNum: 116, weight: 30 },    // Lowercase t
  { char: "r", charNum: 114, weight: 32 },    // Lowercase r
  { char: "j", charNum: 106, weight: 35 },    // Lowercase j
  { char: "J", charNum: 74, weight: 35 },     // Uppercase J
  { char: "7", charNum: 55, weight: 35 },     // Digit 7
  { char: "F", charNum: 70, weight: 35 },     // Uppercase F
  { char: "T", charNum: 84, weight: 35 },     // Uppercase T
  { char: "L", charNum: 76, weight: 35 },     // Uppercase L
  { char: "P", charNum: 80, weight: 40 },     // Uppercase P
  { char: "E", charNum: 69, weight: 40 },     // Uppercase E
  { char: "Z", charNum: 90, weight: 40 },     // Uppercase Z
  { char: "3", charNum: 51, weight: 40 },     // Digit 3
  { char: "2", charNum: 50, weight: 40 },     // Digit 2
  { char: "5", charNum: 53, weight: 40 },     // Digit 5
  { char: "S", charNum: 83, weight: 40 },     // Uppercase S
  { char: "z", charNum: 122, weight: 40 },    // Lowercase z
  { char: "s", charNum: 115, weight: 40 },    // Lowercase s
  { char: "c", charNum: 99, weight: 40 },     // Lowercase c
  { char: "v", charNum: 118, weight: 40 },    // Lowercase v
  { char: "u", charNum: 117, weight: 40 },    // Lowercase u
  { char: "n", charNum: 110, weight: 40 },    // Lowercase n
  { char: "x", charNum: 120, weight: 40 },    // Lowercase x
  { char: "y", charNum: 121, weight: 40 },    // Lowercase y
  { char: "k", charNum: 107, weight: 40 },    // Lowercase k
  { char: "a", charNum: 97, weight: 40 },     // Lowercase a
  { char: "e", charNum: 101, weight: 40 },    // Lowercase e
  { char: "o", charNum: 111, weight: 40 },    // Lowercase o
  { char: "d", charNum: 100, weight: 40 },    // Lowercase d
  { char: "p", charNum: 112, weight: 40 },    // Lowercase p
  { char: "q", charNum: 113, weight: 40 },    // Lowercase q
  { char: "b", charNum: 98, weight: 40 },     // Lowercase b
  { char: "h", charNum: 104, weight: 40 },    // Lowercase h
  { char: "g", charNum: 103, weight: 40 },    // Lowercase g
  { char: "m", charNum: 109, weight: 40 },    // Lowercase m
  { char: "w", charNum: 119, weight: 40 },    // Lowercase w
  { char: "6", charNum: 54, weight: 45 },     // Digit 6
  { char: "9", charNum: 57, weight: 45 },     // Digit 9
  { char: "4", charNum: 52, weight: 45 },     // Digit 4
  { char: "8", charNum: 56, weight: 45 },     // Digit 8
  { char: "0", charNum: 48, weight: 45 },     // Digit 0
  { char: "B", charNum: 66, weight: 45 },     // Uppercase B
  { char: "R", charNum: 82, weight: 45 },     // Uppercase R
  { char: "D", charNum: 68, weight: 45 },     // Uppercase D
  { char: "O", charNum: 79, weight: 45 },     // Uppercase O
  { char: "Q", charNum: 81, weight: 45 },     // Uppercase Q
  { char: "G", charNum: 71, weight: 45 },     // Uppercase G
  { char: "C", charNum: 67, weight: 45 },     // Uppercase C
  { char: "U", charNum: 85, weight: 45 },     // Uppercase U
  { char: "N", charNum: 78, weight: 45 },     // Uppercase N
  { char: "H", charNum: 72, weight: 45 },     // Uppercase H
  { char: "K", charNum: 75, weight: 45 },     // Uppercase K
  { char: "V", charNum: 86, weight: 45 },     // Uppercase V
  { char: "Y", charNum: 89, weight: 45 },     // Uppercase Y
  { char: "X", charNum: 88, weight: 45 },     // Uppercase X
  { char: "W", charNum: 87, weight: 45 },     // Uppercase W
  { char: "A", charNum: 65, weight: 45 },     // Uppercase A
  { char: "M", charNum: 77, weight: 45 },     // Uppercase M
  // Heaviest characters (maximum coverage)
  { char: "@", charNum: 64, weight: 50 },     // At symbol
  { char: "#", charNum: 35, weight: 50 },     // Hash
  { char: "$", charNum: 36, weight: 50 },     // Dollar
  { char: "%", charNum: 37, weight: 50 },     // Percent
  { char: "&", charNum: 38, weight: 50 },     // Ampersand
  { char: "*", charNum: 42, weight: 50 },     // Asterisk
  { char: "+", charNum: 43, weight: 50 },     // Plus
  { char: "=", charNum: 61, weight: 50 },     // Equals
  { char: "~", charNum: 126, weight: 50 },    // Tilde
  { char: "^", charNum: 94, weight: 50 },     // Caret
  { char: "_", charNum: 95, weight: 50 },     // Underscore
  { char: "{", charNum: 123, weight: 50 },    // Left brace
  { char: "}", charNum: 125, weight: 50 },    // Right brace
  { char: "[", charNum: 91, weight: 50 },     // Left bracket
  { char: "]", charNum: 93, weight: 50 },     // Right bracket
  { char: "\\", charNum: 92, weight: 50 },    // Backslash
  { char: "/", charNum: 47, weight: 50 },     // Forward slash
  { char: "<", charNum: 60, weight: 50 },     // Less than
  { char: ">", charNum: 62, weight: 50 },     // Greater than
  { char: "?", charNum: 63, weight: 50 },     // Question mark
  { char: "(", charNum: 40, weight: 50 },     // Left parenthesis
  { char: ")", charNum: 41, weight: 50 },     // Right parenthesis
  { char: "-", charNum: 45, weight: 50 },     // Hyphen
  { char: "\"", charNum: 34, weight: 50 }     // Double quote
];

// Global variables for weight analysis
let MIN_WEIGHT = Infinity;
let MAX_WEIGHT = -Infinity;
let WEIGHT_TO_CHAR = new Map();

// Function to process character weights table
function processCharacterWeights(weightsTable) {
  console.log("Processing character weights table...");
  
  // Find min and max weights
  for (const entry of weightsTable) {
    if (entry.weight < MIN_WEIGHT) {
      MIN_WEIGHT = entry.weight;
    }
    if (entry.weight > MAX_WEIGHT) {
      MAX_WEIGHT = entry.weight;
    }
  }
  
  console.log(`Weight range: ${MIN_WEIGHT} to ${MAX_WEIGHT}`);
  
  // Build weight-to-character map, logging duplicates
  for (const entry of weightsTable) {
    if (WEIGHT_TO_CHAR.has(entry.weight)) {
      console.log(`Duplicate weight ${entry.weight}: '${entry.char}' (${entry.charNum}) - keeping '${WEIGHT_TO_CHAR.get(entry.weight)}'`);
    } else {
      WEIGHT_TO_CHAR.set(entry.weight, entry.char);
    }
  }
  
  console.log(`Weight-to-character map contains ${WEIGHT_TO_CHAR.size} unique weights`);
}

// Initialize weight analysis
processCharacterWeights(CHARACTER_WEIGHTS);

// Function to find character with equal or greater weight
function findCharacterByWeight(targetWeight) {
  // Convert map to sorted array of weights for easier searching
  const sortedWeights = Array.from(WEIGHT_TO_CHAR.keys()).sort((a, b) => a - b);
  
  // Find first weight that is >= targetWeight
  for (const weight of sortedWeights) {
    if (weight >= targetWeight) {
      return {
        character: WEIGHT_TO_CHAR.get(weight),
        weight: weight
      };
    }
  }
  
  // If no weight >= targetWeight, return the heaviest character
  const maxWeight = Math.max(...sortedWeights);
  return {
    character: WEIGHT_TO_CHAR.get(maxWeight),
    weight: maxWeight
  };
}

// Function to process text output with a mathematical function
function textOutFunction(f) {
  let cumulativeSum = 0;
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
  svgContent += `  <!-- Text positioning grid for mathematical function output -->
  <!-- Character width: ${CHARACTER_WIDTH_PIXELS}px, Line height: ${LINE_HEIGHT_PIXELS}px -->
  <!-- Traditional specs: ${CHARACTERS_PER_INCH_HORIZONTAL} chars/inch horizontal, ${LINES_PER_INCH_VERTICAL} lines/inch vertical -->
`;

  // Loop through rows 0 to 65
  for (let row = 0; row <= 65; row++) {
    // Loop through columns 0 to 131
    for (let col = 0; col <= 131; col++) {
      // Calculate x and y based on the formula
      const x = col / 10;
      const y = row / 6;
      
      // Calculate z using the provided function
      let z = f(x, y);
      
      // Cap z between 0 and 1
      z = Math.max(0, Math.min(1, z));
      
      // Multiply z by the maximum character weight
      z *= MAX_WEIGHT;
      
      // Add to cumulative sum
      cumulativeSum += z;
      
      // Find character based on cumulative sum
      const { character, weight } = findCharacterByWeight(cumulativeSum);
      
      // Subtract the weight from cumulative sum
      cumulativeSum -= weight;
      
      // Place the character at the current position
      svgContent = placeCharacter(svgContent, character, col, row);
    }
  }

  svgContent += '</svg>';
  
  return svgContent;
}

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
    return textOutFunction(f);
}

function f(x, y) {
    let z = g((x-6.6)/5, (y-5.5)/5);
    z = 1-z;
    z = Math.min(1,Math.max(0,z));
    return z
}

// function g(x, y) {
//     const r2 = x * x + y * y;
//     if (r2 >= 1) {
//         return 0
//     }
//     const z = Math.sqrt(1-r2);
//     let dot = x*5 + y*2 + z*(-1);
//     // dot /= Math.sqrt(5*5 + 2*2 + 1*1);
//     return Math.max(0, dot);
// }

function g(x, y) {
    let r2 = x*x + y*y;
    let r = Math.sqrt(r2);
    let z = Math.cos(r*10);
    z += (x*0.8+y*0.3);
    return z;
}

function main() {
    try {
        const svgContent = generateSVG();
        const outputPath = path.join(__dirname, '../../../tools-outputs/svg-graphics/seq15-green-bar-graphics.svg');
        
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