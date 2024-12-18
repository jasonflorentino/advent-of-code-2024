import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const games = lines.filter(Boolean).reduce((games, line) => {
        if (line.startsWith('Button A')) {
            games.push([line]);
        } 
        if (line.startsWith('Button B')) {
            games[games.length - 1].push(line);
        } 
        if (line.startsWith('Prize')) {
            const lastGame = games[games.length-1];
            lastGame.push(line);
            // game lines collected; parse it. 
            games[games.length-1] = lastGame.reduce((game, l) => {
                const [k, v] = parseLine(l);
                game[k] = v;
                return game;
            }, {});
        } 
        return games;
    }, []);
    return games;
}

function parseLine(line) {
    if (line.startsWith('Button')) {
        return parseButton(line);
    }
    return parsePrize(line);
}

function parseButton(line) {
    const [name, spec] = parseSpec(line, /\+/);
    return [name.replace('Button ', ''), spec];
}

function parsePrize(line) {
    const [_, spec] = parseSpec(line, '=');
    return ['P', spec];
}

function parseSpec(line, sep) {
    const [name, s] = line.split(':');
    const spec = s.split(',').reduce((o, s) => {
        const vals = s.trim().split(sep);
        o[vals[0]] = Number(vals[1]);
        return o;
    }, {})
    return [name, spec];
}

const Cost = {
    A: 3,
    B: 1,
}

function lowestCost1(game) {
    const {A, B, P} = game;
    const winCosts = [];
    
    let A_times = Math.floor(P.X / A.X);
    
    while (A_times >= 0) {
        let AXtotal = A.X * A_times;
        let PXremdr = P.X - AXtotal;
        if (PXremdr % B.X !== 0) {
            A_times--;
            continue;
        } 
        let B_times = PXremdr / B.X;
        
        let BYtotal = B.Y * B_times;
        let PYremdr = P.Y - BYtotal;
        if (PYremdr - (A.Y * A_times) !== 0) {
            A_times--;
            continue;
        }
        const cost = (A_times * Cost.A) + (B_times * Cost.B);
        winCosts.push(cost);
        A_times--;
    }
    
    return winCosts.length ? Math.min(...winCosts) : 0;
}

// lowerCost2
//
// Consider one of the games:
// A: X+94, Y+34 | B: X+22, Y+67 | P: X=8400, Y=5400
//
// And its solution for the number of times each button must be pressed (tA, tB):
//   P      A    tA   B    tB
// X 8400 - 94 * 80 - 22 * 40 = 0
// Y 5400 - 34 * 80 - 67 * 40 = 0
//
// This is really a system of two linear equations. To find the missing values, we use Cramer's rule
// which expresses the solution in terms of the determinants of special matracies of the known terms
//
//      | px bx |                         | ax px |
//      | py by |   px by - bx py         | ay py |   ax py - px ay
// tA = --------- = ------------- ,  tB = --------- = -------------
//      | ax bx |   ax by - bx ay         | ax bx |   ax by - bx ay
//      | ay by |                         | ay by |
//
function lowestCost2(game) {
    const {A, B, P} = game;
    
    const det1 = det(P.X, P.Y, B.X, B.Y);
    const det2 = det(A.X, A.Y, B.X, B.Y);
    const det3 = det(A.X, A.Y, P.X, P.Y);
    
    const tA = det1 / det2;
    const tB = det3 / det2; 

    if (tA % 1 !== 0) return 0;
    if (tB % 1 !== 0) return 0;
    
    return Cost.A * tA + Cost.B * tB;
}

function det(a1, a2, b1, b2) {
    return a1 * b2 - b1 * a2;
}

const OFF = 10_000_000_000_000;

function main(name) {
    const games = loadInput(name);
    let cost = 0;
    for (const game of games) {
        cost += lowestCost1(game);
    }
    console.log(cost); 
    // 39996
    
    cost = 0;
    const games2 = games.map((g) => ({...g, 
        P: { X: g.P.X + OFF, Y: g.P.Y + OFF },
    }));
    for (const game of games2) {
        cost += lowestCost2(game);
    }
    console.log(cost); 
    // 73267584326867 
}

main(process.argv[2]);