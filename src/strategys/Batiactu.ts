import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetElements, GetGoogleInfos, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Batiactu(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetElements(data);

  return elements.reduce((acc: candidateStrategiesResult[], element: cheerio.Element) => {
    const { link, title, desc } = GetGoogleInfos(data, element);
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
