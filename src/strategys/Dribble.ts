import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Dribble(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://dribbble.com/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    const img = GetProfileGenders(title);

    acc.push({
      link,
      img,
      fullName: title || undefined,
      currentJob: undefined,
      currentCompany: undefined,
      resume: desc?.trim(),
    });

    return acc;
  }, [] as candidateStrategiesResult[]);
}
