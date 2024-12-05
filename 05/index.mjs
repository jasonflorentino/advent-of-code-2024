import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name)
        .toString()
        .trim()
        .split('\n')
        .map((l) => l.trim()); 
    const rules = lines
        .filter((l) => l.includes('|'))
        .map((r) => r.trim().split('|').map(Number));
    const updates = lines
        .filter((l) => l.includes(','))
        .map((u) => u.trim().split(',').map(Number))
    return { rules, updates } 
}

function isUpdateOrdered(update, rules) {
    for (let i = 0; i < update.length; i++) {
        const p1 = update[i];
        for (let j = i+1; j < update.length; j++) {
            const p2 = update[j];
            if (!pagesAreOrdered(p1, p2, rules)) {
                return false;
            }
        }
    }
    return true
}

function pagesAreOrdered(a, b, rules) {
    const relevant = rules.filter((r) => r.includes(a) && r.includes(b));
    return relevant.every((r) => r[0] === a); 
}

function sumMiddlePageNums(total, update) {
    const mid = update.length >> 1;
    return total + update[mid];
}

function sortUpdate(update, rules) {
    const relevant = rules.filter((r) => r.every((p) => update.includes(p)))
    const sorted = [];
    while (sorted.length !== update.length) {
        sorted.push(findMin(sorted, update, relevant))
    }
    return sorted;
}

function findMin(sorted, update, rules) {
    const min = update.find((p) => {
        const relevant = rules.filter((r) => {
            return !r.some((n) => sorted.includes(n)) && r.includes(p)
        })
        return relevant.length && relevant.every((r) => r[0] === p);
    })
    return min;
}


function main(name) {
    const { rules, updates } = loadInput(name)
    
    // one
    // Determine which updates are already in the correct order. What do you get if you add up the
    // middle page number from those correctly-ordered updates?
    const ordered = updates.filter((u) => isUpdateOrdered(u, rules));
    const total1 = ordered.reduce(sumMiddlePageNums, 0);
    console.log(total1); 
    
    // two
    // Find the updates which are not in the correct order. What do you get if you add up the middle
    // page numbers after correctly ordering just those updates?
    const unordered = updates.filter((u) => !isUpdateOrdered(u, rules));
    const total2 = unordered.map((u) => sortUpdate(u, rules)).reduce(sumMiddlePageNums, 0);
    console.log(total2)
}

main(process.argv[2])