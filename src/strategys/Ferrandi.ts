import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Ferrandi(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://www.ferrandialumni.fr/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const extractInfos = (text: string) => {
      const [fullName, diplome, currentJob] = text.split(' - ').filter(part => !/CV\s*/g.test(part));
      return { fullName, diplome, currentJob };
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
