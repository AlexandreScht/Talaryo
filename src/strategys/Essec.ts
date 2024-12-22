import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { profileMatcher } from '@/utils/regrex';
import { load } from 'cheerio';

export default function Essec(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://www.essecalumni.com/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const extractInfos = (text: string) => {
      const parts = text.replace(/ - Resume/g, '').split(' - ');
      if (parts.length > 2) {
        const [firstPart, secondPart, ...lastPart] = parts;
        const groupedPart = lastPart.join(' ');

        const filteredParts = [firstPart, secondPart, groupedPart]
          .sort((a, b) => (/\ESSEC \d{4}\b/.test(a) ? 1 : /\ESSEC \d{4}\b/.test(b) ? -1 : 0))
          .filter((v, i) => v && (i !== 1 || !v.startsWith('ESSEC ')) && !v.startsWith('CV_ ') && !v.startsWith('CV '));
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
      if (parts.length === 2) {
        const [fullName, diplome] = parts
          .sort((a, b) => (/\ESSEC \d{4}\b/.test(a) ? 1 : /\ESSEC \d{4}\b/.test(b) ? -1 : 0))
          .map(v => v.replace(profileMatcher, ''))
          .filter(v => v);
        return { fullName: fullName?.trim(), diplome: diplome?.trim() };
      }
      return { fullName: undefined };
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
