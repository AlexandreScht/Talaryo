import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Batiactu(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://reseau.batiactu.com/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const splitTitle = title.match(/\(([^)]+)(?:\)|\.{3})/);
    if (!splitTitle) {
      return;
    }
    const currentCompany = splitTitle[1]?.trim();
    const remainingText = title.split(splitTitle[0]);
    const fullName = remainingText[0]?.trim() || undefined;
    const img = GetProfileGenders(fullName);

    acc.push({
      link,
      img,
      fullName,
      currentJob: undefined,
      currentCompany,
      resume: desc?.trim(),
    });

    return acc;
  }, [] as candidateStrategiesResult[]);
}
