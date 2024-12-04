import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const data = lines.map((l) => l.split(''));
    return data 
}

const MOVE = {
    ee: [1, 0],
    se: [1, 1],
    ss: [0, 1],
    sw: [-1, 1],
    ww: [-1, 0],
    nw: [-1, -1],
    nn: [0, -1],
    ne: [1, -1],
};

// one

const MAS = 'MAS';

/**
 * @returns true when there is an XMAS starting at [x, y] in direction moveK
 */
function checkDir(x, y, data, moveK) {
    let currX = x;
    let currY = y;
    for (const c of MAS) {
        currX += MOVE[moveK][0];
        currY += MOVE[moveK][1];
        if (c === data[currY]?.[currX]) {
            continue;
        }
        return false;
    }   
    return true;
}

/**
 * @returns an array where each index represents a direction starting from [x, y]. Array[i] is true
 * when that direction makes XMAS.
 */
function checkAllDir(x, y, data) {
    const results = Object.keys(MOVE).map(
        (moveK) => checkDir(x, y, data, moveK)
    )
    return results;
}

// two

const X_MOVE ={ 
    forw: [MOVE.ne, MOVE.sw],
    back: [MOVE.nw, MOVE.se]
}

/**
 * @returns true when there is a MAS around [x, y]
 */
function checkX_Mas(x, y, data, x_moveK) {
    let hasM = false;
    let hasS = false;
    for (const pos of X_MOVE[x_moveK]) {
        const c = data[y + pos[1]]?.[x + pos[0]];
        hasM = hasM || 'M' === c;
        hasS = hasS || 'S' === c;
    }   
    return hasM && hasS;
}

/**
 * @returns true when there is an X-MAS at [x, y]
 */
function checkAllX_Mas(x, y, data) {
    const results = Object.keys(X_MOVE).map(
        (x_moveK) => checkX_Mas(x, y, data, x_moveK)
    )
    return results.every(Boolean);
}

function main(name) {
    const data = loadInput(name)

    // one
    // Take a look at the little Elf's word search. How many times does XMAS appear?
    let oneTotal = 0;
    for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[y].length; x++) {
            if ('X' === data[y][x]) {
                const result = checkAllDir(x, y, data)
                oneTotal += result.filter(Boolean).length;
            }
        }
    }
    console.log(oneTotal);
    
    // two
    // Flip the word search from the instructions back over to the word search side and try again.
    // How many times does an X-MAS appear?
    let twoTotal = 0;
    for (let y = 0; y < data.length; y++) {
        for (let x = 0; x < data[y].length; x++) {
            if ('A' === data[y][x]) {
                twoTotal += checkAllX_Mas(x, y, data)
            }
        }
    }
    console.log(twoTotal);
}

main(process.argv[2])