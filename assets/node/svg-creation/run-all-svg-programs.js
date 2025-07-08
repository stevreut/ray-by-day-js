const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DIR = __dirname;

function getScriptFiles() {
    // Match files like *-NN.js, where NN is a two-digit number
    const files = fs.readdirSync(DIR)
        .filter(f => /-\d{2}\.js$/.test(f))
        .sort((a, b) => {
            // Extract the number for sorting
            const aNum = parseInt(a.match(/-(\d{2})\.js$/)[1], 10);
            const bNum = parseInt(b.match(/-(\d{2})\.js$/)[1], 10);
            return aNum - bNum;
        });
    return files;
}

function runScript(script) {
    console.log(`\n=== Running: ${script} ===`);
    const result = spawnSync('node', [path.join(DIR, script)], { stdio: 'inherit' });
    if (result.error) {
        console.error(`Error running ${script}:`, result.error);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(`Script ${script} exited with code ${result.status}`);
        process.exit(result.status);
    }
}

function main() {
    const scripts = getScriptFiles();
    if (scripts.length === 0) {
        console.log('No SVG creation scripts found.');
        return;
    }
    scripts.forEach(runScript);
    console.log('\nAll SVG creation scripts completed successfully.');
}

if (require.main === module) {
    main();
} 