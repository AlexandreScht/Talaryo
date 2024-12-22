import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { profileMatcher } from '@/utils/regrex';
import { load } from 'cheerio';

export default function Polytechnique(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://ax.polytechnique.org/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const extractInfos = (text: string) => {
      const filteredTitle = text.replace(/ - Resume/g, '').replace(profileMatcher, '');
      const partFiltered = filteredTitle.split(' | ');
      if (partFiltered?.length > 1) {
        const [fullName, diplome] = partFiltered[0].split(' - ');
        return { fullName, diplome };
      }

      const [fullName, other] = filteredTitle.split(' - ');
      if (other.startsWith('Polytechnique')) {
        return { fullName, currentJob: other };
      }
      return { fullName, diplome: other };
    };
    const { fullName, diplome, currentJob } = extractInfos(title);
    if (fullName) {
      const img = GetProfileGenders(fullName);

      acc.push({
        link,
        img,
        fullName,
        diplome,
        currentJob: currentJob || undefined,
        currentCompany: undefined,
        resume: desc?.trim(),
      });
    }

    return acc;
  }, [] as candidateStrategiesResult[]);
}
