import fs from 'node:fs';

function loadInput(name) {
    const data = fs.readFileSync(name).toString().trim().split('').map(Number); 
    return data;
}

function buildDiskmap(data) {
    const diskmap = [];
    let fileId = 0;
    data.forEach((block, i) => {
        const id = i % 2 === 0 ? fileId++ : undefined;
        while (block-- > 0) {
            diskmap.push(id);
        }
    })
    return diskmap;
}

const SPACE = '.';

function buildObjDiskmap(data) {
    const diskmap = [];
    let fileId = 0;
    data.forEach((size, idx) => {
        const id = idx % 2 === 0 ? fileId++ : SPACE;
        diskmap.push({ id, size, idx });
    })
    return diskmap;
}

function compactDiskmap(diskmap) {
    diskmap = diskmap.slice();
    let s1 = 0;
    let s2 = diskmap.length - 1;
    while (s1 < s2) {
        while (diskmap[s1] !== undefined) s1++;
        while (diskmap[s2] === undefined) s2--;
        if (s1 < s2) {
            diskmap[s1] = diskmap[s2];
            diskmap[s2] = undefined; 
        }
    }
    return diskmap;
}

function computeChecksum(diskmap) {
    return diskmap.reduce((checksum, fileid, idx) => {
        if (fileid !== undefined) {
            checksum += fileid * idx;
        }
        return checksum;
    }, 0);
}

function computeObjChecksum(objDiskmap) {
    let idx = 0;
    return objDiskmap.reduce((checksum, {size, id}) => {
        while (size--) {
            checksum += (id === SPACE ? 0 : id) * idx++;
        }
        return checksum;
    }, 0);
}

function compactDiskmapContiguous(objDiskmap) {
    let diskmap = objDiskmap.slice();
    let fIdx = diskmap.length - 1;
    while (fIdx > 0) {
        const file = diskmap[fIdx];
        if (!file || file.id === SPACE) {
            fIdx--;
            continue;
        }
        const sIdx = diskmap.findIndex((block) => block.id === SPACE && file.size <= block.size);
        if (sIdx === -1 || sIdx > fIdx) {
            fIdx--;
            continue;
        }
        diskmap[sIdx].size = diskmap[sIdx].size - file.size;
        diskmap[fIdx] = {id: SPACE, size: file.size, idx: -1};
        diskmap = [...diskmap.slice(0, sIdx), file, ...diskmap.slice(sIdx, diskmap.length)];
        fIdx--;
    }
   return diskmap.filter(({size}) => size > 0); 
}

function main(name) {
    const data = loadInput(name);

    // Compact the amphipod's hard drive using the process he requested. What is the resulting 
    // filesystem checksum?
    const diskmap = buildDiskmap(data);
    const compact = compactDiskmap(diskmap);
    console.log(computeChecksum(compact));
    // 1928
    // 6349606724455
    
    // Start over, now compacting the amphipod's hard drive using this new method instead. What is 
    // the resulting filesystem checksum?
    const diskmap2  = buildObjDiskmap(data);
    const compact2 = compactDiskmapContiguous(diskmap2);
    console.log(computeObjChecksum(compact2));
    // 2858
    // 6376648986651
}

main(process.argv[2])