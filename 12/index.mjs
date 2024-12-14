import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const data = lines.map((l) => l.split(''));
    return data;
}

const MOVES = [[1, 0], [0, 1], [-1, 0], [0, -1]];

function getNeighbours([x, y], field) {
    const n = [];
    for (const [dX, dY] of MOVES) {
        const x2 = x + dX;
        const y2 = y + dY;
        n.push([x2, y2]);
    }
    if (field) {
        return n.filter((p) => field.exists(p));
    }
    return n;
} 

function areNeighbours(a, [bX, bY], field) {
    const n = getNeighbours(a, field)
    for (const [nX, nY] of n) {
        if (nX === bX && nY === bY) {
            return true;
        }
    }    
    return false;
}


const Dirs = {
    N: 'N',
    S: 'S',
    E: 'E',
    W: 'W',
}

function toFreeEdges(dArr) {
    /** edge => isCounted */ 
    const freeEdges = new Map(Object.values(Dirs).map((e) => [e, 0]));
    dArr.forEach((d) => {
        switch (d) {
            case Dirs.E:
                freeEdges.delete(Dirs.E);
                break;
            case Dirs.W:
                freeEdges.delete(Dirs.W);
                break;
            case Dirs.N:
                freeEdges.delete(Dirs.N);
                break; 
            case Dirs.S:
                freeEdges.delete(Dirs.S);
                break;
        }
    })
    return freeEdges
}

class PlotSet {
    constructor(name) {
        this.name = name;
        /** { y: Set() } */
        this.r = {};
    }
    size() {
        return Object.values(this.r).reduce((t, s) => t + s.size, 0);
    }
    has([x, y]) {
        return this.r[y]?.has(x);
    }
    add([x, y]) {
        if (!this.r[y]) {
            this.r[y] = new Set();
        }
        this.r[y].add(x);
    }
    price1() {
        return this.size() * this.perimeter();
    }
    price2() {
        return this.size() * this.sides();
    }
    toNodes(y) {
        return Array.from(this.r[y]).map((x) => [x, Number(y)]);
    }
    perimeter() {
        const nodes = Object.keys(this.r).flatMap((y) => this.toNodes(y));
        let p = 0;
        for (const node of nodes) {
            const n = this.neighbours(node, nodes);
            p += 4 - n.length;
        }
        return p;
    }
    sides() {
        const nodes = Object.keys(this.r).flatMap((y) => this.toNodes(y));
        for (const node of nodes) {
            const neighbours = this.neighbours(node, nodes);
            const freeEdges = toFreeEdges(neighbours.map((n) => this.direction(node, n)));
            node.push(neighbours, freeEdges);
        }
        let s = 0;
        for (const node of nodes) {
            if (node[3].size === 0) {
                continue;
            }
            node[3].forEach((counted, edge) => {
                if (!counted) {
                    s += 1;
                }
                node[3].set(edge, 1);
                for (const n of node[2]) {
                    if (n[3].has(edge)) {
                        n[3].set(edge, 1);
                    }
                };
            });
        }
        return s;
    }
    direction(a, b) {
        switch(true) {
            case a[0] === b[0] && a[1] < b[1]:
                return Dirs.S;
            case a[0] === b[0] && a[1] > b[1]:
                return Dirs.N;
            case a[1] === b[1] && a[0] < b[0]:
                return Dirs.E;
            case a[1] === b[1] && a[0] > b[0]:
                return Dirs.W;
            default:
                throw new Error('a == b');
        }
    }
    neighbours(node, nodes) {
        return nodes.filter((n) => areNeighbours(node, n))
    }
}


class Field {
    constructor(data) {
        this.f = data;
    }
    toPlant([x, y]) {
        return this.f[y][x];
    }
    isOOB([x, y]) {
        return this.f[y]?.[x] === undefined;
    }
    exists(p) {
        return !this.isOOB(p);
    }
}

class Gardens {
    constructor() {
        /** { plant: []PlotSet } */
        this.g = {};
    }
    totalPrice1() {
        return Object.values(this.g).flat().reduce((t, p) => t += p.price1(), 0);
    }
    totalPrice2() {
        return Object.values(this.g).flat().reduce((t, p) => t += p.price2(), 0);
    }
    add(plant, plotSet) {
        if (!this.g[plant]) {
            this.g[plant] = [];
        }
        this.g[plant].push(plotSet);
    }
}

function main(name) {
    const data = loadInput(name);
    const field = new Field(data);
    
    const q = [[0, 0]];
    const gardens = new Gardens();
    const visited = new PlotSet('visited');
    while (q.length) {
        const plot = q.shift();
        if (visited.has(plot)) continue;
        visited.add(plot);
        const plant = field.toPlant(plot); 
        const garden = new PlotSet(plant);
        garden.add(plot);
        const neighbours = getNeighbours(plot, field);
        while (neighbours.length) {
            const n = neighbours.shift();
            if (visited.has(n)) continue;
            if (plant === field.toPlant(n)) {
                visited.add(n);
                garden.add(n);        
                neighbours.push(...getNeighbours(n, field));
            } else {
                q.push(n);
            }
        }
        gardens.add(plant, garden);
    }
    
    console.log('one:', gardens.totalPrice1()); // 1483212
    console.log('two:', gardens.totalPrice2()); // 897062
}

main(process.argv[2]);