import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const data = lines.map((l) => l.split(''));
    return data 
}

function printG(grid) {
    console.log();
    console.log(grid.map((l) => l.join(' ')).join('\n'));
    console.log();
}

function iterCoords(grid, fn) {
    let res;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            res = fn(x, y, grid);
        }
    }
    return res;
}

const ANTINODE = '#';
const SPACE = '.';

function plotAntiNode(a, grid) {
    grid[a[1]][a[0]] = ANTINODE;
    return grid;
}

function isOOB(x, y, grid) {
    return grid[y]?.[x] === undefined;
}

function computeAntiNodeOffset(a, b) {
    const [aX, aY] = a;
    const [bX, bY] = b;
    return [aX - bX, aY - bY]
}

function computeAntiNode(a, b) {
    const [dX, dY] = computeAntiNodeOffset(a, b); 
    const [aX, aY] = a;
    return [aX + dX, aY + dY];
}

function computeAntiNodePair(a, b) {
    return [
        computeAntiNode(a, b),
        computeAntiNode(b, a)
    ]; 
}

function last(arr) {
    return arr[arr.length - 1];
}

function computeAntiNodesWithin(a, b, grid) {
    const antiNodes = [b];
    const antiNodesWithin = [a];
    while (antiNodes.length) {
        const a = last(antiNodesWithin);
        const b = antiNodes.pop();
        if (isOOB(b[0], b[1], grid)) {
            break;
        }
        antiNodesWithin.push(b);
        antiNodes.push(computeAntiNode(b, a));
    }
    return antiNodesWithin.slice(0);
}

function collectMatchingNodes(x, y, grid, collection) {
    const val = grid[y][x];
    if (val === SPACE) {
        return collection;
    }
    if (collection[val]) {
        collection[val].push([x, y]);
    } else {
       collection[val]  = [[x,y]];
    }
    return collection;
}

class UniqNodes {
    constructor() {
        this.nodeMap = {};
    }
    count() {
        let total = 0;
        for (const Xs of Object.values(this.nodeMap)) {
            total += Xs.length; 
        }
        return total;
    }
    add(x, y) {
        if (this.has(x, y)) {
            return false;
        }
        if (this.nodeMap[y]) {
            this.nodeMap[y].push(x);
        } else {
            this.nodeMap[y] = [x];
        }
        return true;
    }
    has(x, y) {
        if (this.nodeMap[y]) {
            for (const x2 of this.nodeMap[y]) {
                if (x2 === x) {
                    return true;
                }
            }
        }
        return false;
    }
}

function main(name) {
    
    const one = () => {
        const grid = loadInput(name)
        printG(grid)
        const nodeGroups = {};
        iterCoords(grid, (x, y, grid) => collectMatchingNodes(x, y, grid, nodeGroups))
        const uniqNodes = new UniqNodes();
        for (const nodes of Object.values(nodeGroups)) {
            for (let a = 0; a < nodes.length; a++) {
                for (let b = a + 1; b < nodes.length; b++) {
                    const antiNodes = computeAntiNodePair(nodes[a], nodes[b]);
                    antiNodes.forEach(([x, y]) => {
                        if (!isOOB(x, y, grid)) {
                            uniqNodes.add(x, y);
                        }
                    })
                }
            }
        }
        console.log(uniqNodes.count()); 
    }
    one(); // 359
    
    const two = () => {
        const grid = loadInput(name)
        const nodeGroups = {};
        iterCoords(grid, (x, y, grid) => collectMatchingNodes(x, y, grid, nodeGroups))
        const uniqNodes = new UniqNodes();
        for (const nodes of Object.values(nodeGroups)) {
            for (let a = 0; a < nodes.length; a++) {
                for (let b = a + 1; b < nodes.length; b++) {
                    const directions = [[nodes[a], nodes[b]], [nodes[b], nodes[a]]];
                    for (const [nodeA, nodeB] of directions) {
                        const antiNodes = computeAntiNodesWithin(nodeA, nodeB, grid);
                        antiNodes.forEach((node) => {
                            plotAntiNode(node, grid);
                            uniqNodes.add(...node);
                        })
                    }
                }
            }
        }
        console.log(uniqNodes.count()); 
    }
    two(); // 1293

}

main(process.argv[2])