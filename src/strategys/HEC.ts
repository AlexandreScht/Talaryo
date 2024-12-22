import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { normalizeString } from '@/utils/serializer';
import { load } from 'cheerio';

export default function HEC(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://www.hecalumni.fr/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;

    const extractInfos = (text: string) => {
      const parts = text
        .replace(/ - Resume/g, '')
        .replace(/ - CV_/g, ' - ')
        .replace(/ - CV(\s\.\.\.)?/g, ' - ')
        .replace(/\d+\s+page\s+\w+\s+\d{4}$/g, '')
        .split(' - ')
        .filter(v => v);
      if (parts?.length <= 1) {
        return { fullName: undefined };
      }
      const filteredParts = parts.filter(part => !/\bHEC \d{4}\b/.test(part));
      const matchedParts = parts.filter(part => /\bHEC \d{4}\b/.test(part));
      const reorderedParts = filteredParts.concat(matchedParts);

      const equalityMatch = (arr: string[]) => {
        const trimmedStr1 = arr[0].trim().replace(/\s+/g, '_');
        const trimmedStr2 = arr[1].trim().replace(/\s+/g, '_');
        if (trimmedStr2 === trimmedStr1) {
          return undefined;
        }
        return arr[1].trim();
      };

      const testStartsWith = (arr: string[]) => {
        const lowerStr1 = normalizeString(arr[0]);
        const lowerStr2 = normalizeString(arr[1]);

        if (lowerStr2.startsWith(lowerStr1)) {
          return undefined;
        }
        return arr[1].trim();
      };

      if (reorderedParts.length > 2) {
        return {
          fullName: reorderedParts[0]?.trim(),
          currentCompany: equalityMatch(reorderedParts),
          diplome: reorderedParts[reorderedParts.length - 1]?.trim(),
        };
      }
      return {
        fullName: reorderedParts[0]?.trim(),
        currentCompany: undefined,
        diplome: testStartsWith(reorderedParts),
      };
    };

    const { fullName, diplome, currentCompany } = extractInfos(title);
    if (fullName) {
      const img = GetProfileGenders(fullName);
      acc.push({ link, img, fullName, diplome, currentCompany: currentCompany || undefined, resume: desc?.trim() });
    }

    return acc;
  }, [] as candidateStrategiesResult[]);
}
