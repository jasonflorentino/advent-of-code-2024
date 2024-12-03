import fs from "node:fs"

const lines = fs.readFileSync(process.argv[2]).toString().trim().split('\n');
const list1 = [];
const list2 = [];
for (const line of lines) {
    const [a, b] = line.split(" ").filter((s) => s.length)
    list1.push(Number(a.trim()));   
    list2.push(Number(b.trim()));
}
list1.sort();
list2.sort();
if (list1.length !== list2.length) {
    throw new Error('list lengths dont match?', list1.length, list2.length);
}

// one
// Your actual left and right lists contain many location IDs.
// What is the total distance between your lists?
let total1 = 0;
for (let i = 0; i < list1.length; i++) {
    total1 += Math.abs(list1[i] - list2[i]);
}
console.log(total1);

// two
// Once again consider your left and right lists. What is their similarity score?
const count = {};
let total2 = 0;
for (const id of list2) {
    if (count[id] === undefined) {
        count[id] = 1;
    } else {
        count[id]++;
    }
}
for (const id of list1) {
    total2 += id * (count[id] ?? 0);
}
console.log(total2);