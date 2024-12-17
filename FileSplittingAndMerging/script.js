const fs = require('fs');
const path = require('path');

// validating arguments 

if (process.argv.length !== 4) {
    if (process.argv.length < 4) {
        console.error('Usage: node script.js <file_path> <lines_per_file>');
    } else {
        console.error('Error: Too many arguments provided.');
        console.error('Usage: node script.js <file_path> <lines_per_file>');
    }
    process.exit(1);
}

const filePath = process.argv[2];
const linesPerFile = parseInt(process.argv[3], 10);


// validating file format

if (path.extname(filePath) !== '.txt') {
    console.error(`The file must have a .txt extension.`);
    process.exit(1);
}


// validating lines per file input

if (isNaN(linesPerFile) || linesPerFile <= 0) {
    console.error('The number of lines per file must be a positive integer.');
    process.exit(1);
}


//file exists?

if (!fs.existsSync(filePath)) {
    console.error(`The file "${filePath}" does not exist.`);
    process.exit(1);
}


fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`error reading the file: ${err.message}`);
        process.exit(1);
    }

    const lines = data.split('\n');
    const totalLines = lines.length;
    // console.log(lines)
    const fileName = path.basename(filePath, path.extname(filePath));
    const outputDir = path.join(path.dirname(filePath), `${fileName}_split`);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    let fileIndex = 1;
    for (let i = 0; i < totalLines; i += linesPerFile) {
        const chunk = lines.slice(i, i + linesPerFile).join('\n');
        const outputFilePath = path.join(outputDir, `part${fileIndex}.txt`);
        fs.writeFileSync(outputFilePath, chunk, 'utf8');
        console.log(`Created: ${outputFilePath}`);
        fileIndex++;
    }

    console.log(`Successfully split the file into ${fileIndex - 1} parts.`);
    

    // merging the files

    console.log('Merging the split files');
    const outputFilePath = path.join(path.dirname(filePath), `${fileName}_merged.txt`);
    const splitFiles = fs
        .readdirSync(outputDir)
        .filter((file) => path.extname(file) === '.txt')
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/), 10); 
            const numB = parseInt(b.match(/\d+/), 10);
            return numA - numB; 
        });

    const writeStream = fs.createWriteStream(outputFilePath, { flags: 'w' });

    splitFiles.forEach((file, index) => {
        const splitFilePath = path.join(outputDir, file);
        const fileContent = fs.readFileSync(splitFilePath, 'utf8');
        writeStream.write(fileContent + (index < splitFiles.length - 1 ? '\n' : ''));
    });

    writeStream.end(() => {
        console.log(`Successfully merged files into "${outputFilePath}"`);
    });


});

