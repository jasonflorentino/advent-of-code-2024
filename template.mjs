import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const data = lines
    return data 
}

function main(name) {
    const data = loadInput(name)
    console.log(data.length)
}

main(process.argv[2])