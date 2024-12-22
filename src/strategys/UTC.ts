import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { profileMatcher } from '@/utils/regrex';
import { normalizeString } from '@/utils/serializer';
import { load } from 'cheerio';

export default function UTC(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://www.alumni.utc.fr/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const extractInfos = (text: string) => {
      const splitTitle = text.split(' - ');
      if (splitTitle.length > 2) {
        const extractJob = (currentJob: string, fullName: string) => {
          const normalJob = normalizeString(currentJob);
          const normalName = normalizeString(fullName);

          if (normalJob.includes(normalName.replace('_', ''))) {
            const updatedJob = normalJob.replace(new RegExp(normalName.replace('_', '') + '(_)?', 'i'), '').trim();
            return updatedJob?.trim();
          }
          return currentJob?.trim();
        };
        const [fullName, diplome, currentJob] = splitTitle.filter(part => !/CV[_ ]/g.test(part));
        return { fullName: fullName?.trim(), diplome: diplome?.trim(), currentJob: currentJob ? extractJob(currentJob, fullName) : undefined };
      }
      if (/ \| UTC Alumni/.test(text)) {
        const infoPart = text
          .replace(/CV\s*/g, '')
          .split(' | ')
          .filter(part => !part.startsWith('UTC Alumni'))[0];
        const extractPart = infoPart.split(' - ');
        if (extractPart?.length === 2) {
          const [fullName, diplome] = extractPart;
          return { fullName: fullName?.trim(), diplome: diplome?.trim() };
        }
        const [fullName, currentJob] = infoPart.split('/');
        return { fullName: fullName?.trim(), currentJob: currentJob?.trim() };
      }
      if (splitTitle.length === 2) {
        const filteredParts = splitTitle.filter(part => !/\UTC \d{4}\b/.test(part)).map(part => part.replace(profileMatcher, ''));
        const matchedParts = splitTitle.filter(part => /\UTC \d{4}\b/.test(part));
        const reorderedParts = filteredParts.concat(matchedParts);
        return { fullName: reorderedParts[0]?.trim(), diplome: reorderedParts[1]?.trim() };
      }
      return { fullName: undefined };
    };
    const { fullName, diplome, currentJob } = extractInfos(title);
    if (fullName) {
      const img = GetProfileGenders(fullName);

      acc.push({ link, img, fullName, diplome, currentJob, currentCompany: undefined, resume: desc?.trim() });
    }

    return acc;
  }, [] as candidateStrategiesResult[]);
}
