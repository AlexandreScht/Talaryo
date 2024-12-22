// Importation des modules nécessaires
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const htmlFilePath = path.join(__dirname, 'src', 'libs', 'scraped_pages', 'scrape.html');

function findDivsWithSameClass(data, n) {
  const $ = data;

  const classMap = {};

  $('div').each((index, div) => {
    const classes = $(div).attr('class');
    if (classes) {
      const classList = classes.split(/\s+/);
      classList.forEach(cls => {
        if (!classMap[cls]) {
          classMap[cls] = [];
        }
        classMap[cls].push($(div));
      });
    }
  });

  const matchingClasses = [];

  for (const [cls, divs] of Object.entries(classMap)) {
    if (divs.length >= n) {
      const selectedDivs = divs.slice(0, n);
      matchingClasses.push({
        className: cls,
        divs: selectedDivs,
      });
    }
  }

  return matchingClasses;
}

fs.readFile(htmlFilePath, 'utf8', (err, html) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier HTML :', err);
    return;
  }
  const $ = cheerio.load(html);

  const liensLinkedIn = [];
  $('a[href^="https://fr.linkedin.com/"]').each((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      liensLinkedIn.push(href);
    }
  });

  console.log(`Nombre de liens LinkedIn trouvés : ${liensLinkedIn.length}`);

  if (liensLinkedIn.length === 0) {
    console.log('Aucun lien LinkedIn trouvé. Fin du script.');
    return;
  }

  const t = findDivsWithSameClass($, liensLinkedIn.length);

  console.log(t);
  
});
