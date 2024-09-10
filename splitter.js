const fs = require('fs');
const path = require('path');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const DirPath = path.join(__dirname, 'emails');
const outputDir = path.join(__dirname, 'emails-data');

const totalObjects = 6257171; // Total number of objects to process
let processedObjects = 0;
let totalData = 0;

const emailMap = new Map();

// Function to process all JSON files in a directory
async function processFiles() {
  try {
    const files = fs.readdirSync(DirPath).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(DirPath, file);
      const pipeline = chain([fs.createReadStream(filePath), parser(), streamArray()]);

      pipeline.on('data', ({ value: obj }) => {
        if (emailMap.has(obj.email)) {
          const existingEntry = emailMap.get(obj.email);
          const mergedValues = Object.entries(existingEntry).reduce((acc, [key, value]) => {
            if (!value) {
              acc[key] = obj[key];
            } else {
              const arrValue = Array.isArray(value) ? value : [value];
              arrValue.push(obj[key]);
              // arrValue.filter(v => v !== obj[key]).push(obj[key]);
              acc[key] = arrValue;
            }
            return acc;
          }, {});
          emailMap.set(obj.email, mergedValues);
        } else {
          emailMap.set(obj.email, obj);
          totalData++;
        }

        processedObjects++;
        const percentage = ((processedObjects / totalObjects) * 100).toFixed(2);
        process.stdout.write(`\rProcessing: ${percentage}% (${processedObjects} objects processed)`);
      });

      await new Promise(resolve => pipeline.on('end', resolve));
    }

    // Stream write to avoid memory issues with JSON.stringify
    writeToMultipleFiles(outputDir, Array.from(emailMap.values()));

    console.log('\nProcessing complete! Total processed: ' + totalData);
  } catch (err) {
    console.error('Failed to process files:', err);
  }
}

// Function to write data into multiple files
function writeToMultipleFiles(outputDir, data, maxEntriesPerFile = 1_500_000) {
  let fileIndex = 0;
  let currentEntries = [];

  data.forEach((obj, index) => {
    currentEntries.push(obj);

    if (currentEntries.length === maxEntriesPerFile || index === data.length - 1) {
      fs.writeFileSync(path.join(outputDir, `emailData-${fileIndex}.json`), JSON.stringify(currentEntries, null, 2));
      currentEntries = [];
      fileIndex++;
    }
  });
}

processFiles();
