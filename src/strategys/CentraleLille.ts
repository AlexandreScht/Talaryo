import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetElements, GetGoogleInfos, GetProfileGenders } from '@/libs/scrapping';
import { dateMatcher, profileMatcher } from '@/utils/regrex';
import { load } from 'cheerio';

export default function CentraleLille(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetElements(data);

  return elements.reduce((acc: candidateStrategiesResult[], element: cheerio.Element) => {
    const { link, title, desc } = GetGoogleInfos(data, element);
    const extractInfos = (text: string) => {
      const parts = text.replace(dateMatcher, '').split(' - ');
      if (parts.length === 2) {
        const processArray = (array: string[]) => {
          return array.flatMap(string =>
            string.startsWith('CV') ? (string.match(/^CV\s+(\w+\s+\w+)\s+(.*)$/) ? [RegExp.$1, RegExp.$2] : string) : string,
          );
        };
        const filteredArray = processArray(parts)
          .map(v => v.replace(profileMatcher, '').replace(/CV-/, ''))
          .sort((a, b) => (/\b\d{4}\b/.test(a) ? 1 : /\b\d{4}\b/.test(b) ? -1 : 0));

        if (filteredArray.length === 3) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [fullName, _, diplome] = filteredArray;
          return {
            fullName: fullName?.trim(),
            diplome: diplome?.trim(),
          };
        }
        const [fullName, diplome] = filteredArray;
        return { fullName: fullName?.trim(), diplome: diplome?.trim() };
      }
      if (parts.length > 2) {
        const [fullName, diplome, currentJob] = parts
          .map(v => v.replace(profileMatcher, '').replace(/CV-/, ''))
          .filter(v => v && v?.trim() !== '...');
        return { fullName: fullName?.trim(), diplome: diplome?.trim(), currentJob: currentJob?.trim() };
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
