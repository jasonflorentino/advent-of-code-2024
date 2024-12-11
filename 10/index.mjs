import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const data = lines.map((l) => l.split('').map(Number));
    return data;
}

// pretty print the map
// ...with not so pretty code
function toCarte(grid) {
    const HEAD = '.';
    const PEAK = '^';
    const SPACE = ' ';
    const rowsWithHeaders = grid.map((row, i) => (
        [i % 10 + '|', ...row.map((h) => h === 0 ? HEAD : h === 9 ? PEAK : h)].join(SPACE)
    ));
    return [
        ['  ', ...grid.map((_, i) => i % 10)].join(SPACE), 
        ' +' + '-'.repeat(grid.length * 2), 
        ...rowsWithHeaders
    ].join('\n');
}

class Position {
    static SEP = ','
    static toId(position) {
        return position.x + this.SEP + position.y;
    }
    static fromId(id) {
        return id.split(this.SEP);
    }
    constructor(x, y, h) {
        this.x = x;
        this.y = y;
        this.h = h;
        this.id = Position.toId(this);
    }
    isTrailhead() {
        return this.h === 0;
    }
    isTrailEnd() {
        return this.h === 9;
    }
    isReachable(h) {
        return h - this.h === 1;
    }
}

class Trails {
    constructor() {
        this.trailheads = [];
        /** { [trailheadId]: Position[] } */
        this.trails = {};
    }
    trailScore1(tail) {
        const ends = [];
        tail.forEach((p) => ends.includes(p.id) ? 0 : ends.push(p.id));
        return ends.length;
    }
    trailScore2(tail) {
        return tail.length;
    }
    totalScore1() {
        let total = 0;
        for (const trailends of Object.values(this.trails)) {
            total += this.trailScore1(trailends);
        }
        return total; 
    }
    totalScore2() {
        let total = 0;
        for (const trailends of Object.values(this.trails)) {
            total += this.trailScore2(trailends);
        }
        return total; 
    }
    addTrail(head, end) {
        if (this.trails[head.id]) {
            this.trails[head.id].push(end);
        } else {
            this.trails[head.id] = [end];
        }
    }
}

const MOVES = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
]

class TopoMap {
    /** @param {Position[][]} positions */
    constructor(positions) {
        this.positions = positions;
        this.trailheads = positions.map((row) => row.filter((p) => p.isTrailhead())).flat();
        this.visited = [];
    }
    getPosition(id) {
        const [x, y] = Position.fromId(id);
        return this.positions[y][x];
    }
    reachableFrom(id) {
        const positions = [];
        const a = this.getPosition(id, true);
        if (!a) {
            return positions;
        }
        for (const [dX, dY] of MOVES) {
            const p = this.positions[a.y + dY]?.[a.x + dX];
            if (p && a.isReachable(p.h) && !this.isVisited(p.id)) {
                positions.push(p);
            }
        } 
        return positions;
    }
    markVisited(id) {
        this.visited.push(id);
    }
    isVisited(id) {
        return this.visited.includes(id);
    }
    clearVisited() {
        this.visited = [];
    }
}

function main(name) {
    const data = loadInput(name);
    console.log(toCarte(data));

    /** @type {Position[][]} */
    const positions = [];
    for (let y = 0; y < data.length; y++) {
        const row = [];
        for (let x = 0; x < data[y].length; x++) {
           row.push(new Position(x, y, data[y][x])); 
        }
        positions.push(row);
    }

    const trails = new Trails();
    const topoMap = new TopoMap(positions);

    for (const trailhead of topoMap.trailheads) {
        topoMap.clearVisited();
        const positions = topoMap.reachableFrom(trailhead.id);
        while (positions.length) {
            const p = positions.shift();
            topoMap.markVisited(p.id);
            if (p.isTrailEnd()) {
                trails.addTrail(trailhead, p); 
            }
            const reachableFromP = topoMap.reachableFrom(p.id);
            positions.push(...reachableFromP);
        }
    }

    console.log(trails.totalScore1()); // 427
    console.log(trails.totalScore2()); // 969
}

main(process.argv[2])