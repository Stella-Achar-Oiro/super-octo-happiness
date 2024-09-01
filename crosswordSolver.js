function parsePuzzle(puzzle) {
    if (typeof puzzle !== 'string' || puzzle.trim() === '') {
        return null;
    }
    const rows = puzzle.trim().split('\n');
    const grid = rows.map(row => row.split(''));
    return grid;
}

function findWordPositions(grid) {
    const positions = [];
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const cell = grid[row][col];
            if (!isNaN(cell) && cell > '0' && cell <= '2') {
                const count = parseInt(cell, 10);
                positions.push({ row, col, count });
            }
        }
    }
    
    return positions;
}

function validateWordCount(grid, words) {
    let expectedWordCount = 0;
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const cell = grid[row][col];
            if (!isNaN(cell) && cell > '0' && cell <= '2') {
                expectedWordCount += parseInt(cell, 10);
            }
        }
    }
    
    return expectedWordCount === words.length && new Set(words).size === words.length;
}

function canPlaceWord(grid, word, row, col, direction) {
    const wordLength = word.length;

    if (direction === 'horizontal') {
        if (col + wordLength > grid[row].length) return false;
        for (let i = 0; i < wordLength; i++) {
            const cell = grid[row][col + i];
            if (cell !== '0' && cell !== word[i] && cell !== '.' && isNaN(cell)) return false;
        }
    } else if (direction === 'vertical') {
        if (row + wordLength > grid.length) return false;
        for (let i = 0; i < wordLength; i++) {
            const cell = grid[row + i][col];
            if (cell !== '0' && cell !== word[i] && cell !== '.' && isNaN(cell)) return false;
        }
    }
    return true;
}

function placeWord(grid, word, row, col, direction) {
    if (!canPlaceWord(grid, word, row, col, direction)) return false;

    const wordLength = word.length;

    if (direction === 'horizontal') {
        for (let i = 0; i < wordLength; i++) {
            grid[row][col + i] = word[i];
        }
    } else if (direction === 'vertical') {
        for (let i = 0; i < wordLength; i++) {
            grid[row + i][col] = word[i];
        }
    }

    return true;
}

function removeWord(grid, word, row, col, direction) {
    const wordLength = word.length;
    if (direction === 'horizontal') {
        for (let i = 0; i < wordLength; i++) {
            grid[row][col + i] = '0';
        }
    } else if (direction === 'vertical') {
        for (let i = 0; i < wordLength; i++) {
            grid[row + i][col] = '0';
        }
    }
}

function crosswordSolver(puzzle, words) {
    const grid = parsePuzzle(puzzle);
    if (!grid || !Array.isArray(words) || words.length === 0) return 'Error';
    
    const positions = findWordPositions(grid);
    if (!validateWordCount(grid, words)) return 'Error';

    let solutionsFound = 0;

    const backtrack = (index) => {
        if (index === words.length) {
            solutionsFound++;
            return solutionsFound === 1;
        }
        const word = words[index];
        for (const { row, col, count } of positions) {
            if (count > 0) {
                if (placeWord(grid, word, row, col, 'horizontal')) {
                    if (backtrack(index + 1)) return true;
                    removeWord(grid, word, row, col, 'horizontal');
                }
                if (placeWord(grid, word, row, col, 'vertical')) {
                    if (backtrack(index + 1)) return true;
                    removeWord(grid, word, row, col, 'vertical');
                }
            }
        }
        return false;
    };

    const hasSolution = backtrack(0);
    if (!hasSolution || solutionsFound > 1) return 'Error';

    return gridToString(grid);
}

function gridToString(grid) {
    return grid.map(row => row.join('')).join('\n');
}

// Test cases
function runTest(puzzle, words) {
    console.log("Puzzle:");
    console.log(puzzle);
    console.log("Words:", words);
    console.log("Result:");
    console.log(crosswordSolver(puzzle, words));
    console.log("\n");
}

// Test case 1
runTest('2001\n0..0\n1000\n0..0', ['casa', 'alan', 'ciao', 'anta']);

// Test case 2
runTest(
`...1...........
..1000001000...
...0....0......
.1......0...1..
.0....100000000
100000..0...0..
.0.....1001000.
.0.1....0.0....
.10000000.0....
.0.0......0....
.0.0.....100...
...0......0....
..........0....`,
['sun', 'sunglasses', 'suncream', 'swimming', 'bikini', 'beach', 'icecream', 'tan', 'deckchair', 'sand', 'seaside', 'sandals']
);

// Test case 3
runTest(
`..1.1..1...
10000..1000
..0.0..0...
..1000000..
..0.0..0...
1000..10000
..0.1..0...
....0..0...
..100000...
....0..0...
....0......`,
['popcorn', 'fruit', 'flour', 'chicken', 'eggs', 'vegetables', 'pasta', 'pork', 'steak', 'cheese']
);

// Test case 4
runTest('2001\n0..0\n1000\n0..0', ['casa', 'casa', 'ciao', 'anta']);

// Test case 5
runTest('0001\n0..0\n3000\n0..0', ['casa', 'alan', 'ciao', 'anta']);

// Test case 6
runTest('2001\n0..0\n1000\n0..0', ['casa', 'casa', 'ciao', 'anta']);

// Test case 7
runTest('', ['casa', 'alan', 'ciao', 'anta']);

// Test case 8
runTest(123, ['casa', 'alan', 'ciao', 'anta']);

// Test case 9
runTest('', 123);

// Test case 10
runTest('2001\n0..0\n1000\n0..0', ['aaab', 'aaac', 'aaad', 'aaae']);