import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { profileMatcher } from '@/utils/regrex';
import { load } from 'cheerio';

export default function Neoma(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://www.neoma-alumni.com/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const extractInfos = (text: string) => {
      const parts = text.split(' - ');
      if (parts.length === 1) {
        const [fullName] = parts.filter(v => v.startsWith('CV ')).map(v => v.replace('CV de', '').replace(profileMatcher, ' '));
        return { fullName: fullName?.trim() };
      }
      if (parts.length === 2) {
        const [fullName, diplome] = parts
          .sort((a, b) => (/\NEOMA \d{4}\b/.test(a) ? 1 : /\NEOMA \d{4}\b/.test(b) ? -1 : 0))
          .map(v => v.replace(profileMatcher, ''))
          .filter(v => v);
        const splitName = fullName.split(' ');
        if (splitName.length > 2) {
          return {
            fullName: splitName.splice(0, 2).join(' ')?.trim(),
            diplome: diplome?.trim(),
            currentJob: splitName.join(' ')?.trim(),
          };
        }
        return { fullName: fullName?.trim(), diplome: diplome?.trim() };
      }
      if (parts.length > 2) {
        const [firstPart, secondPart, ...lastPart] = parts;
        const groupedPart = lastPart.join(' ');

        const filteredParts = [firstPart, secondPart, groupedPart]
          .sort((a, b) => (/\NEOMA \d{4}\b/.test(a) ? 1 : /\NEOMA \d{4}\b/.test(b) ? -1 : 0))
          .filter(v => v && !v.startsWith('CV') && !v.startsWith('CV ') && !v.startsWith('CV-') && !v.startsWith('CV_'));
        if (filteredParts.length === 3) {
          const [fullName, currentJob, diplome] = filteredParts;
          return {
            fullName: fullName?.trim(),
            diplome: diplome?.trim(),
            currentJob: currentJob?.trim(),
          };
        }
        const [fullName, diplome] = filteredParts;
        return {
          fullName: fullName?.trim(),
          diplome: diplome?.trim(),
          currentJob: undefined,
        };
      }
    };
    const { fullName, diplome, currentJob } = extractInfos(title);
    if (fullName) {
      const img = GetProfileGenders(fullName);

      acc.push({
        link,
        img,
        fullName,
        diplome,
        currentJob,
        currentCompany: undefined,
        resume: desc?.trim(),
      });
    }

    return acc;
  }, [] as candidateStrategiesResult[]);
}
