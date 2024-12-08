import fs from 'node:fs'

const Mark = {
    WALL: '#',
    GUARD : '^',
}

const Dir = {
    N: 'N',
    E: 'E',
    S: 'S',
    W: 'W',
}

const DirOrder = [Dir.N, Dir.E, Dir.S, Dir.W];

const Step = {
    N: [0, -1],
    S: [0, 1],
    W: [-1, 0],
    E: [1, 0]
}

function concat(...args) {
    return args.join(' ');
}

function getStep(dIdx) {
    return Step[toDir(dIdx)];
}

function toDir(dIdx) {
    return DirOrder[dIdx];
}

function toDidx(dir) {
    return DirOrder.findIndex((d) => d === dir);
}

function nextXY(x, y, d) {
    const nextS = getStep(toDidx(d));
    const nextX = x + nextS[0]; 
    const nextY = y + nextS[1];
    return [nextX, nextY];
}

function nextDidx(dIdx) {
    return (dIdx + 1) % DirOrder.length;
}

function nextDir(d) {
    return toDir(nextDidx(toDidx(d)))
}

class Guard {
    constructor(x, y, d = Dir.N) {
        this.x = x;
        this.y = y;
        this.d = d;
        this.oob = false;
        this.walked = [];
    } 
    turn() {
        this.d = nextDir(this.d);
    }
    nextXY() {
        return nextXY(this.x, this.y, this.d);
    }
    hasWalked(x, y, d) {
        return this.walked.some(([wX, wY, wD]) => wX === x && wY === y && wD === d);
    }
    uniqWalked() {
        return this.walked.reduce((uniq, [x, y]) => {
            if (uniq.some(([uX, uY]) => uX === x && uY === y)) {
                return uniq;
            }
            uniq.push([x, y]);
            return uniq;
        }, [])    
    }
    step(grid) {
        if (this.hasWalked(this.x, this.y, this.d)) {
            throw concat('already walked', this.x, this.y, this.d);
        }
        this.walked.push([this.x, this.y, this.d]);
        const [nextX, nextY]  = this.nextXY();
        if (grid.isWall(nextX, nextY)) {
            this.turn();
            return this.step(grid);
        }
        this.oob = grid.isOOB(nextX, nextY);
        this.x = nextX;
        this.y = nextY;
    }
    isOOB() {
        return this.oob;
    }
}


class Grid {
    constructor(grid) {
        this.grid = grid;
    }
    addWall(x, y) {
        this.grid[y][x] = Mark.WALL;
    }
    isOOB(x, y) {
        return this.grid[y]?.[x] === undefined; 
    }
    isWall(x, y) {
       return this.grid[y]?.[x] === Mark.WALL;
    }
    coords() {
        const pos = [];
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                pos.push([x, y]);
            }
        }
        return pos;
    }
    getGuardStart() {
        for (const [x, y] of this.coords()) {
            if (this.grid[y][x] === Mark.GUARD) {
                return [x, y];
            }
        }
    }
}

function loadInput(name) {
    const rows = fs.readFileSync(name).toString().trim().split('\n'); 
    const grid = rows.map((r) => r.split('')); 
    return grid 
}

function main(name) {
    let uniqPositions;
    
    const one = () => {
        const grid = new Grid(loadInput(name));
        const [gX, gY] = grid.getGuardStart();    
        const guard = new Guard(gX, gY);
        while (!guard.isOOB()) {
            guard.step(grid);
        }
        uniqPositions = guard.uniqWalked();
        console.log(uniqPositions.length);
    }
    one(); //5129
    
    const two = () => {
        const possibleObs = [];
        for (let i = 0; i < uniqPositions.length; i++) {
            if (i === 0) {
               continue; 
            }
            const grid = new Grid(loadInput(name));
            const [gX, gY] = grid.getGuardStart();    
            const guard = new Guard(gX, gY);
            
            const [uX, uY] = uniqPositions[i];
            grid.addWall(uX, uY);

            while (!guard.isOOB()) {
                try {
                    guard.step(grid);
                } catch (err) {
                    possibleObs.push([uX, uY]);
                    break;
                }
            }
        }
        console.log(possibleObs.length);
    }
    two(); //1888
}

main(process.argv[2])