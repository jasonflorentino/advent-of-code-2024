import fs from 'node:fs'

function loadInput(name) {
    const eqs = fs.readFileSync(name).toString().trim().split('\n'); 
    const parts = eqs.map((eq) => eq.split(':'));
    return parts.map(([res, ops]) => [Number(res), ops.split(' ').filter(Boolean).map(Number)]);
}

const Operators = {
    'add': (x, y) => x + y,
    'mul': (x, y) => x * y,
}

function toBasedValues(n, vals, width) {
    const bits = [];
    if (n === 0) {
        bits.push(vals[0]);
    } else {
        let x = n;
        while (x > 0) {
            bits.push(vals[x % vals.length]);
            x = Math.floor(x / vals.length);
        }
    }
    while (bits.length < width) {
        bits.push(vals[0]);
    }
    return bits.reverse(); 
}

function evaluate(operands, permutation, operators) {
    const opds = operands.slice().reverse();
    const opts = permutation.slice().reverse();
    let total = opds.pop();
    while (opds.length) {
        total = operators[opts.pop()](total, opds.pop());
    }
    return total;
}

function main(name) {
    const data = loadInput(name)
    
    const one = (data, operators) => {
        const opKeys = Object.keys(operators);
        const valid = data.filter(([res, operands]) => {
            const optCount = opKeys.length ** (operands.length - 1);
            const optPerms = [];
            for (let i = 0; i < optCount; i++) {
                optPerms.push(toBasedValues(i, opKeys, operands.length - 1));
            }
            for (const perm of optPerms) {
                if (res === evaluate(operands, perm, operators)) {
                    return true;
                }
            }
            return false;
        })
        console.log(valid.reduce((total, [res]) => total + res, 0));
    }
    one(data, Operators);
    // 7710205485870
    
    one(data, { ...Operators, concat: (x, y) => Number(String(x) +  String(y)) });
    // 20928985450275
}


main(process.argv[2])

