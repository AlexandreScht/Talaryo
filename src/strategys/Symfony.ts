import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetElements, GetGoogleInfos, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Symfony(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetElements(data);

  return elements.reduce((acc: candidateStrategiesResult[], element: cheerio.Element) => {
    const { link, title, desc } = GetGoogleInfos(data, element);
    const matchTitle = title.match(/^(.*)\s+a\.k\.a\./);
    const fullName = matchTitle && matchTitle[1] ? matchTitle[1]?.trim() : title?.trim() || undefined;
    const img = GetProfileGenders(fullName);

    acc.push({ link, img, fullName, currentJob: undefined, currentCompany: undefined, resume: desc?.trim() });

    return acc;
  }, [] as candidateStrategiesResult[]);
}
