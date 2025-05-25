const fs = require('fs');
const readline = require('readline');

const buildIndex = async (inputPath, indexPath) => {
    const fileStream = fs.createReadStream(inputPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    // TODO use writeable streams for better performance and write to file system directly
    const offsets = [];
    let position = 0;

    for await (const line of rl) {
        offsets.push(position);
        position += Buffer.byteLength(line + '\n');
    }

    const indexData = {
        mtime: fs.statSync(inputPath).mtime.toISOString(),
        offsets: offsets
    };

    // TODO maybe use a more efficient data structure for storing offsets
    fs.writeFileSync(indexPath, JSON.stringify(indexData), 'utf8');

    return offsets
};

const readLineUsingIndex = async (inputPath, offsets, lineNumber) => {
    if (lineNumber >= offsets.length) {
        throw new Error("Cannot find the line");
    }

    const fileStream = fs.createReadStream(inputPath, {
        start: offsets[lineNumber],
        end: offsets[lineNumber + 1] ? offsets[lineNumber + 1] - 1 : Infinity
    });

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let line = '';
    for await (const currentLine of rl) {
        line = currentLine;
        break; // We only need the first line from this stream
    }

    return line.trim();
};

async function readIndex(indexPath, pathToFile) {
    // TODO error handling for invalid file or index file or corrupted index file
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    const storedMtime = indexData.mtime;
    const currentMtime = fs.statSync(pathToFile).mtime.toISOString();

    // If the stored mtime doesn't match the current mtime, regenerate the index file
    if (storedMtime !== currentMtime) {
        return await buildIndex(pathToFile, indexPath);
    } else {
        return indexData.offsets;
    }
}

const findLine = async (pathToFile, lineNumber) => {
    const indexPath = pathToFile + '.idx';

    let offsets = []
    if (!fs.existsSync(indexPath)) {
        offsets = await buildIndex(pathToFile, indexPath);
    } else {
        offsets = await readIndex(indexPath, pathToFile);
    }

    return readLineUsingIndex(pathToFile, offsets, lineNumber);
};

// Zod or similar library can be used for argument validation
function validateArguments(inputPath, lineIndexStr) {
    if (!inputPath || !lineIndexStr) {
        console.error('Usage: node find_line.js PATH_TO_FILE LINE_NUMBER');
        process.exit(1);
    }

    if (!fs.existsSync(inputPath)) {
        console.error('The specified file does not exist');
        process.exit(1);
    }

    const lineIndex = parseInt(lineIndexStr, 10);
    if (isNaN(lineIndex) || lineIndex < 0) {
        console.error('Line number must be a non-negative integer');
        process.exit(1);
    }
}

async function main() {
    console.time('Execution Time');
    const [, , inputPath, lineIndexStr] = process.argv;

   validateArguments(inputPath, lineIndexStr);

    const lineIndex = parseInt(lineIndexStr, 10);

    try {
        console.log(await findLine(inputPath, lineIndex));
    } catch (err) {
        console.error(err);
        process.exit(1);
    }

    console.timeEnd('Execution Time');
}

main();