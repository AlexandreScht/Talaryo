import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Behance(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://www.behance.net/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const splitTitle = title.split(' on Behance');
    const fullName = splitTitle[0]?.trim() || undefined;
    const img = GetProfileGenders(fullName);

    acc.push({
      link,
      img,
      fullName,
      currentJob: undefined,
      currentCompany: undefined,
      resume: desc?.trim(),
    });

    return acc;
  }, [] as candidateStrategiesResult[]);
}
