import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Symfony(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://connect.symfony.com/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const matchTitle = title.match(/^(.*)\s+a\.k\.a\./);
    const fullName = matchTitle && matchTitle[1] ? matchTitle[1]?.trim() : title?.trim() || undefined;
    const img = GetProfileGenders(fullName);

    acc.push({ link, img, fullName, currentJob: undefined, currentCompany: undefined, resume: desc?.trim() });

    return acc;
  }, [] as candidateStrategiesResult[]);
}
