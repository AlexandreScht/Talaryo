const fs = require('fs');
const path = require('path');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

const DirPath = path.join(__dirname, 'emails-data');
const outputDir = path.join(__dirname, 'final-emails');

const totalObjects = 4428504; // Total number of objects to process
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
        Object.entries(obj).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (key === 'email') {
              obj[key] = obj[key][0];
            } else {
              const arr = [...new Set(value.map(v => v?.trim()))].filter(v => v !== null);
              obj[key] = arr.length > 0 ? arr : null;
            }
          }
        });
        // Store the object in the map by its email
        emailMap.set(obj.email, obj);
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
