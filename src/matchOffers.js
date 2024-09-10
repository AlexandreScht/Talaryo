const graduationLevels = ['Doctorat', 'master1', 'master', 'licence', 'bachelor', 'bac', 'CAP/BEP'];

// const IndeedSearch = {
//   jobName: 'développeur web',
//   homeWork: undefined,
//   salary: { type: 'month', value: 1200 },
//   contract: 'apprentissage',
//   nightWork: false,
//   graduation: ['licence'],
//   loc: 'ile de france',
// };

const normalizeString = str =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const jobSearchRegex = jobSearch => new RegExp(`\\b${jobSearch}\\b`, 'i');

const alternanceJobSearchRegex = (jobSearch, offerTitle) => {
  const wordsToCheck = [
    `Alternance ${normalizeString(jobSearch)} `,
    `Alternance - ${normalizeString(jobSearch)} `,
    `Apprenti ${normalizeString(jobSearch)} `,
  ];

  return wordsToCheck.some(word => offerTitle.startsWith(normalizeString(word)));
};

export default function calculateMatchPercentage(
  { jobName, homeWork, salary, contract, graduation },
  { jobTitle, jobPlace, jobMoney, jobContract, jobGraduation },
) {
  let score = 0,
    total = 0;

  const jobTitleNormalized = normalizeString(jobTitle);

  if (contract && jobContract) {
    total += 30;
    score = jobContract === contract ? +30 : score - 45;
  } else if (contract) total += 15;

  if (graduation?.length && jobGraduation?.length) {
    total += 30;
    if (graduation.length === 1) {
      const [myGraduation] = graduation;
      const myGraduationPos = graduationLevels.indexOf(myGraduation);
      const gradRank = myGraduationPos < 2 ? myGraduationPos + 1 : myGraduationPos;
      graduationLevels.map((grad, idx) => {
        if (jobGraduation.includes(grad)) {
          const rank = idx < 2 ? idx + 1 : idx;
          const diff = rank - gradRank;
          score = diff >= 0 ? score + 30 - diff * 10 : score - 30 + Math.min(diff, 3) * 15;
        }
      });
    } else score = graduation.some(grad => jobGraduation.includes(grad)) ? score + 30 : score - 45;
  } else if (graduation?.length) total += 15;

  if (homeWork && jobPlace) {
    total += 20;
    if (homeWork === jobPlace) {
      score += 20;
    } else if (homeWork === 'fullRemote' && jobPlace === 'occasionally') {
      score += 10;
    } else if (homeWork === 'occasionally' && jobPlace === 'fullRemote') {
      score += 15;
    }
  } else if (homeWork) total += 10;

  if (salary && jobMoney) {
    total += 20;
    const monthlySalary = salary.mensural ? jobMoney / 12 : jobMoney;
    score += monthlySalary >= salary.value ? 20 : 0;
  } else if (salary) total += 10;

  if (jobName) {
    const normalizedJobName = normalizeString(jobName);
    const separatedWords = normalizedJobName.split(' ');
    total += 80;

    const [firstWord, secondWord] = separatedWords;
    const conditions = [
      jobSearchRegex(normalizedJobName).test(jobTitleNormalized),
      separatedWords.length === 2 && jobSearchRegex(`${secondWord} ${firstWord}`).test(jobTitleNormalized),
      jobTitleNormalized.startsWith(`${firstWord} `) ||
        ((contract === 'apprentissage' || contract === 'pro') && alternanceJobSearchRegex(firstWord, jobTitleNormalized)),
    ];

    const scores = [80, 75, 60];
    let conditionMet = false;

    for (let i = 0; i < conditions.length; i++) {
      if (conditions[i]) {
        score += scores[i];
        conditionMet = true;
        break;
      }
    }

    if (!conditionMet) {
      separatedWords.forEach((jobWord, idx, { length }) => {
        if (jobSearchRegex(jobWord).test(jobTitleNormalized)) {
          score += Math.round(80 - (idx * 5) / length);
          console.log(Math.round((80 - idx * 10) / length));
        }
      });
    }
  }
  return Math.round((score < 0 ? 0 : score / total) * 100);
}
