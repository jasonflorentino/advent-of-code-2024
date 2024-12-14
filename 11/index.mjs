import fs from 'node:fs';

function loadInput(name) {
    const parts = fs.readFileSync(name).toString().trim().split(' '); 
    const data = parts.map((p) => Number(p.trim()));
    return data;
}

function isSplittable(n) {
    return String(n).length % 2 === 0;
}

function split(n) {
    const strung = String(n);
    const half = strung.length >> 1;
    return [strung.slice(0, half), strung.slice(half)].map(Number);
}

function nextGen(n) {
    switch (true) {
        case n === 0:
            return [1];
        case isSplittable(n):
            return split(n);
        default:
            return [n * 2024]; 
    }
}

function getNextGen(arr) {
    return arr.flatMap(nextGen);
}

function generate(arr, n) {
    let gen = arr;
    while (n-- > 0) gen = getNextGen(gen);
    return gen;
}

function update(n, c, rec) {
    const res = nextGen(Number(n));
    for (const n2 of res) {
        if (rec[n2]) {
            rec[n2] += c;
        } else {
            rec[n2] = c;
        }
    }
}

function toStoneRecord(stones) {
    return stones.reduce((rec, s) => {
        if (rec[s]) rec[s]++;
        else rec[s] = 1;
        return rec;
    }, {});
}

async function main(name) {
    const data = loadInput(name)
    
    // How many stones will you have after blinking 25 times?
    const nums = generate(data, 25); // 191690
    console.log(nums.length);
    
    // How many stones would you have after blinking a total of 75 times?
    let generation = 0;
    let stones = toStoneRecord(data); 
    while (generation++ < 75) {
        const newGen = {};
        Object.entries(stones).forEach(([n, c]) => update(n, c, newGen));
        stones = newGen;
    } 
    const total = Object.values(stones).reduce((t, n) => t + n, 0);
    console.log(total);
    // 228651922369703
}

main(process.argv[2])