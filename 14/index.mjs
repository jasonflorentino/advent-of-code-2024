import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const data = lines.map((l) => {
        const pv = l.split(' ').reduce((robot, pOrV) => {
            const [k, xy] = pOrV.trim().split('=');
            robot[k] =  xy.split(',').map(Number);
            return robot;
        }, {})
        return pv
    });
    return data;
}

const MOVES = [
    [1,0],
    [1,1],
    [0,1],
    [1,-1],
    [-1,0],
    [-1,-1],
    [0,-1],
    [1,-1],
]

function makeHelpers(maxX, maxY) {
    
    const move = ([startX, startY], [deltaX, deltaY]) => {
        const movX = startX + deltaX;
        const movY = startY + deltaY;
        const resX = movX >= 0 ? movX % maxX : movX + maxX;
        const resY = movY >= 0 ? movY % maxY : movY + maxY;
        return [resX, resY];
    }
    
    const print = (robots, noMiddle) => {
        let grid = new Array(maxY).fill(0).map(() => new Array(maxX).fill('.'));
        for (const robot of robots) {
            const [x, y] = robot.p;
            if (grid[y][x] === '.') {
                grid[y][x] = 1;
            } else {
                grid[y][x]++;
            }
        }
        if (noMiddle) {
            // mask or divide the rows
            grid = grid.map((vals) => {
                return [
                    ...vals.slice(0, vals.length >> 1), 
                    ' ', 
                    ...vals.slice(
                        (vals.length >> 1) + (vals.length % 2 === 0 ? 0 : 1), 
                        vals.length,
                    )
                ];
            })
            // mask or divide the cols 
            grid = [
                ...grid.slice(0, grid.length >> 1), 
                [], 
                ...grid.slice(
                    (grid.length >> 1) + (grid.length % 2 === 0 ? 0 : 1), 
                    grid.length,
                )
            ];
        }
        console.log('');
        console.log(grid.map((row) => row.join('')).join('\n'));
        console.log('');
    }
    
    const safetyFactor = (robots) => {
        const xEven = maxX % 2 === 0;
        const yEven = maxY % 2 === 0;
        const isW = (x) => {
            if (xEven) return x <= (maxX >> 1);
            else return x < (maxX >> 1);
        }
        const isE = (x) => {
            if (xEven) return x >= (maxX >> 1);
            else return x > (maxX >> 1);
        }
        const isN = (y) => {
            if (yEven) return y <= (maxY >> 1);
            else return y < (maxY >> 1);
        }
        const isS = (y) => {
            if (yEven) return y >= (maxY >> 1);
            else return y > (maxY >> 1);
        }
        const counts = [
            [0, 0], // nw, ne,
            [0, 0], // sw, se,
        ];
        for (const robot of robots) {
            const [x, y] = robot.p;
            const xIdx = isW(x) ? 0 : isE(x) ? 1 : null;
            const yIdx = isN(y) ? 0 : isS(y) ? 1 : null;
            // it's in the middle
            if (xIdx === null || yIdx === null) continue;
            counts[yIdx][xIdx] += 1;
        } 
        return counts.reduce((t, row) => t * row[0] * row[1], 1);
    };
    
    const countNeighbours = (robots, x, y) => {
        let c = 0;
        for (const r of robots) {
            const [rx, ry] = r.p
            for (const [dx, dy] of MOVES) {
                if (x + dx === rx && y + dy === ry) {
                    c++;
                }
            }
        }
        return c;
    };
    
    return { move, print, safetyFactor, countNeighbours };
}



function main(name) {
    const maxX = name === 'test' ? 11 : 101;
    const maxY = name === 'test' ? 7 : 103;
    const { 
        move, 
        print, 
        safetyFactor, 
        countNeighbours, 
    } = makeHelpers(maxX, maxY);
    
    // one
    // Predict the motion of the robots in your list within a space which is 101 tiles wide and 103
    // tiles tall. What will the safety factor be after exactly 100 seconds have elapsed?
    const one = () => {
        const robots = loadInput(name);
        let s = 100;
        while (s-- > 0) {
            for (const r of robots) {
                r.p = move(r.p, r.v);
            }
        }
        console.log(safetyFactor(robots));
        // 231782040
    }
    one();
    
    // two
    // What is the fewest number of seconds that must elapse for the robots to 
    // display the Easter egg?
    const two = () => {
        const robots = loadInput(name);
        let i = 0;
        const MAX = 7000;
        const MIN = 6000; // update this as we go to save time 
        const THRES_N = 6; // probably a meaningful number of neighbours
        const THRES_C = 16; // probably an interesting number of clustered bots
        while (++i < MAX) {
            for (const r of robots) r.p = move(r.p, r.v);
            if (i < MIN) continue;
            
            let clustered = 0;
            for (const r of robots) {
                const n = countNeighbours(robots, r.p[0], r.p[1]);
                if (n > THRES_N) clustered++;
            }
            if (clustered > THRES_C) {
                console.log('itr', i);
                print(robots);
            }
        }
        // 6475
    }
    two();

}

main(process.argv[2]);
