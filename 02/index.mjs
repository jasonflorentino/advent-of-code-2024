import fs from 'node:fs'

function loadInput(name) {
    const lines = fs.readFileSync(name).toString().trim().split('\n'); 
    const reports = lines.map((line) => line.split(' ').filter(s => s.length).map(Number));
    return reports;
}

function getDir(curr, prev) {
    return curr < prev ? 'dec' : 'inc';
}

function isSafeLevel(curr, prev, direction) {
        switch (true) {
            case curr === prev:
            case getDir(curr, prev) !== direction:
            case Math.abs(curr - prev) > 3:
                return false;
        }
        return true;
}

function isSafe(report) {
    let direction = getDir(report[1] , report[0]);
    for (let i = 1; i < report.length; i++) {
        const curr = report[i];
        const prev = report[i-1];
        if (!isSafeLevel(curr, prev, direction)) {
            return false;
        } 
    }
    return true;
}

function isSafe2(report) {
    for (let i = 0; i < report.length; i++) {
        const r2 = [...report.slice(0,i), ...report.slice(i+1, report.length)];
        if (isSafe(r2)) {
            return true;
        } 
    }
    return false; 
}

function main() {
    const reports = loadInput('input');
    
    // one
    // Analyze the unusual data from the engineers. How many reports are safe?
    const goodReports = [];
    const badReports = [];
    for (const report of reports) {
        if (isSafe(report)) {
           goodReports.push(report);
        } else {
            badReports.push(report);
        }
    }
    console.log('good reports:', goodReports.length);
    
    // two
    // Update your analysis by handling situations where the Problem Dampener can remove a single
    // level from unsafe reports. How many reports are now safe?
    let almostGood = 0;
    for (const report of badReports) {
        if (isSafe2(report)) {
            almostGood++;
        } 
    }
    console.log('good and almost good reports:', goodReports.length + almostGood);
}
main();

