import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetChips, GetElements, GetGoogleInfos, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function LinkedIn(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetElements(data);

  return elements.reduce((acc: candidateStrategiesResult[], element: cheerio.Element) => {
    const { link, title, desc } = GetGoogleInfos(data, element);
    const titleSeparator = title.split(' - ');
    const chip = GetChips(data, element);

    const fullName = titleSeparator[0]?.toString()?.trim() || undefined;
    const currentJob = chip?.length > 2 ? chip[1].toString().trim() : titleSeparator?.length > 1 ? titleSeparator[1].toString().trim() : undefined;
    const currentCompany =
      titleSeparator?.length > 2 ? titleSeparator[2].toString().trim() : chip?.length > 1 ? chip[chip.length - 1].toString().trim() : undefined;

    const img = GetProfileGenders(fullName);

    acc.push({
      link,
      img,
      fullName,
      currentJob,
      currentCompany,
      resume: desc?.trim(),
    });

    return acc;
  }, [] as candidateStrategiesResult[]);
}
