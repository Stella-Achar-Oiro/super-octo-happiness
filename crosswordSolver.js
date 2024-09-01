const fs = require('fs');  // If you want to handle logging or file output

// Helper function to log messages with different levels
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
    // If logging to a file:
    // fs.appendFileSync('solver.log', `[${timestamp}] [${level}] ${message}\n`);
}

// Enum for directions
const Directions = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical',
    DIAGONAL_UP: 'diagonal-up',     // For future expansion
    DIAGONAL_DOWN: 'diagonal-down', // For future expansion
};

// Memoization cache
const memoCache = new Map();

// Parses the puzzle into a grid
function parsePuzzle(puzzle) {
    if (typeof puzzle !== 'string' || puzzle.trim() === '') {
        log('Invalid puzzle format', 'ERROR');
        return null;
    }
    const rows = puzzle.trim().split('\n');
    const grid = rows.map(row => row.split(''));
    return grid;
}

// Finds potential word positions
function findWordPositions(grid) {
    const positions = [];
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const cell = grid[row][col];
            if (!isNaN(cell) && cell > '0') {
                const count = parseInt(cell, 10);
                positions.push({ row, col, count });
            }
        }
    }
    return positions;
}

// Validates word count against the grid's required number
function validateWordCount(grid, words) {
    let expectedWordCount = 0;
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const cell = grid[row][col];
            if (!isNaN(cell) && cell > '0') {
                expectedWordCount += parseInt(cell, 10);
            }
        }
    }
    return expectedWordCount === words.length && new Set(words).size === words.length;
}

// Memoization function for caching visited states
function generateGridHash(grid) {
    return grid.map(row => row.join('')).join('|');
}

// Can the word be placed in the given direction?
function canPlaceWord(grid, word, row, col, direction) {
    const wordLength = word.length;

    switch (direction) {
        case Directions.HORIZONTAL:
            if (col + wordLength > grid[row].length) return false;
            for (let i = 0; i < wordLength; i++) {
                const cell = grid[row][col + i];
                if (cell === '.') return false;
                if (cell !== '0' && cell !== word[i] && cell !== '.' && isNaN(cell)) return false;
            }
            break;

        case Directions.VERTICAL:
            if (row + wordLength > grid.length) return false;
            for (let i = 0; i < wordLength; i++) {
                const cell = grid[row + i][col];
                if (cell === '.') return false;
                if (cell !== '0' && cell !== word[i] && cell !== '.' && isNaN(cell)) return false;
            }
            break;

        // For future diagonal handling
        case Directions.DIAGONAL_UP:
            // Add logic here
            break;

        case Directions.DIAGONAL_DOWN:
            // Add logic here
            break;
    }

    return true;
}

// Places the word in the given direction
function placeWord(grid, word, row, col, direction) {
    if (!canPlaceWord(grid, word, row, col, direction)) return false;

    const wordLength = word.length;

    switch (direction) {
        case Directions.HORIZONTAL:
            for (let i = 0; i < wordLength; i++) {
                grid[row][col + i] = word[i];
            }
            break;

        case Directions.VERTICAL:
            for (let i = 0; i < wordLength; i++) {
                grid[row + i][col] = word[i];
            }
            break;

        // For future diagonal handling
        case Directions.DIAGONAL_UP:
            // Add logic here
            break;

        case Directions.DIAGONAL_DOWN:
            // Add logic here
            break;
    }

    return true;
}

// Removes the word from the grid
function removeWord(grid, word, row, col, direction) {
    const wordLength = word.length;
    switch (direction) {
        case Directions.HORIZONTAL:
            for (let i = 0; i < wordLength; i++) {
                grid[row][col + i] = '0';
            }
            break;

        case Directions.VERTICAL:
            for (let i = 0; i < wordLength; i++) {
                grid[row + i][col] = '0';
            }
            break;

        // For future diagonal handling
        case Directions.DIAGONAL_UP:
            // Add logic here
            break;

        case Directions.DIAGONAL_DOWN:
            // Add logic here
            break;
    }
}

// Advanced heuristics: Sort words by length, then by potential positions
function sortWordsByHeuristics(words, positions) {
    return words.sort((a, b) => {
        // Sort primarily by length (longer words first)
        return b.length - a.length;
    });
}

// The main solver function using backtracking and memoization
function solveCrossword(puzzle, words) {
    const grid = parsePuzzle(puzzle);
    if (!grid || !validateInput(puzzle, words)) return 'Error';

    const positions = findWordPositions(grid);
    if (!validateWordCount(grid, words)) return 'Error';

    // Prioritize longer words and potential placement difficulty
    const sortedWords = sortWordsByHeuristics(words, positions);

    const result = backtrack(grid, sortedWords, positions, 0);
    return result ? gridToString(grid) : 'Error';
}

// Backtracking function
function backtrack(grid, words, positions, index) {
    if (index === words.length) return true; // All words placed successfully

    const word = words[index];
    const gridHash = generateGridHash(grid);

    // Memoization check
    if (memoCache.has(gridHash)) {
        log(`Skipping previously visited state`, 'DEBUG');
        return false;
    }

    for (const { row, col, count } of positions) {
        if (count > 0) {
            for (const direction of [Directions.HORIZONTAL, Directions.VERTICAL]) {
                if (tryPlaceWord(grid, words, positions, word, row, col, direction, index)) {
                    return true;
                }
            }
        }
    }

    memoCache.set(gridHash, false); // Store result in memo cache
    return false;
}

// Attempts to place a word and continue the backtracking process
function tryPlaceWord(grid, words, positions, word, row, col, direction, index) {
    if (placeWord(grid, word, row, col, direction)) {
        if (backtrack(grid, words, positions, index + 1)) return true;
        removeWord(grid, word, row, col, direction);
    }
    return false;
}

// Converts the grid back to a string format
function gridToString(grid) {
    return grid.map(row => row.join('')).join('\n');
}

// Validates input
function validateInput(puzzle, words) {
    return typeof puzzle === 'string' && Array.isArray(words) && words.length > 0;
}

// Test cases for the solver
function runTest(puzzle, words) {
    console.log("Puzzle:");
    console.log(puzzle);
    console.log("Words:", words);
    console.log("Result:");
    console.log(solveCrossword(puzzle, words));
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