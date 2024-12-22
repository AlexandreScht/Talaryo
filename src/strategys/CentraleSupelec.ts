import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { profileMatcher } from '@/utils/regrex';
import { load } from 'cheerio';

export default function CentraleSupelec(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://association.centralesupelec-alumni.com/cv/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const extractInfos = (text: string) => {
      const parts = text
        .replace(/ - CV(\s\.\.\.)?/g, ' - ')
        .split(' - ')
        .filter(v => v)
        .map(v => v.replace(profileMatcher, ' '));
      if (parts.length > 2) {
        const [fullName, diplome, ...currentJobList] = parts;
        const currentJob = currentJobList.join(' ');
        return { fullName: fullName?.trim(), diplome: diplome?.trim(), currentJob: currentJob?.trim() };
      }
      if (parts.length === 2) {
        const [fullName, diplome] = parts.sort((a, b) => (/\b\d{4}\b/.test(a) ? 1 : /\b\d{4}\b/.test(b) ? -1 : 0));
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
