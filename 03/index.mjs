import fs from 'node:fs'

function loadInput(name) {
    const input = fs.readFileSync(name).toString().trim();
    return input;
}

function parseMuls(input) {
    const mulRe = /mul\((\d\d?\d?),(\d\d?\d?)\)/g;
    return [...input.matchAll(mulRe)];
}

function parseDos(input) {
    const dosRe = /do(n't)?\(\)/g;
    return [...input.matchAll(dosRe)];
}

function main(name) {
    const data = loadInput(name);

    // one
    // Scan the corrupted memory for uncorrupted mul instructions. What do you get if you add up all
    // of the results of the multiplications?
    const muls = parseMuls(data);
    const total = muls.reduce((total, match) => {
        const [_, a, b] = match;
        return total + Number(a) * Number(b);
    }, 0)
    console.log(total);

    // two
    // Handle the new instructions; what do you get if you add up all of the results of just the
    // enabled multiplications?
    const dos = parseDos(data);
    let mulEnabled = true;
    let enabledSum = 0
    for (let i = 0; i < data.length; i++) {
        const doo = dos.find((doo) => doo.index === i);
        if (doo) {
            // index 1 has the (n't) capture group so if that's undefined we have a "do"
            mulEnabled = !doo[1];
        }

        const mul = muls.find((mul) => mul.index === i)
        if (mul && mulEnabled) {
            enabledSum += Number(mul[1]) * Number(mul[2]);
        }  
    }
    console.log(enabledSum)
}

main(process.argv[2]);