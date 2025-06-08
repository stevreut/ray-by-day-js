// Quick note program to convert triplets to hex

main()

function main() {
    const args = process.argv
    processArgs(args)
}

function processArgs(args) {
    if (args.length !== 3) {
        throw 'invalid args'
    }
    argVal = args[2].trim()
    console.log('argVal = ', argVal)
    let numStrArgs = argVal.split(/\s+/)
    console.log('numStrArgs = ', numStrArgs)
    if (numStrArgs.length !== 3) {
        throw 'invalid arg count'
    }
    let result = '#'
    numStrArgs.forEach(itm => {
        let val = parseFloat(itm)
        val *= 255
        val = Math.round(val)
        let valStr = val.toString(16).padStart(2,'0')
        result += valStr
    })
    console.log ('hex of "' + argVal + '"  =  ' + result)
}