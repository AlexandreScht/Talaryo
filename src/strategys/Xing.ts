import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetElements, GetGoogleInfos, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Xing(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetElements(data);

  return elements.reduce((acc: candidateStrategiesResult[], element: cheerio.Element) => {
    const { link, title, desc } = GetGoogleInfos(data, element);
    const splitTitle = title.split(' - ');
    //* name
    const fullName = splitTitle[0]?.trim() || undefined;
    //* extract infos
    const extractInfos = (data: string[]) => {
      if (data.length === 3) {
        return { currentJob: data[1]?.trim(), currentCompany: data[2]?.trim() };
      }
      return { currentJob: data[1]?.trim(), currentCompany: undefined };
    };
    const { currentJob, currentCompany } = extractInfos(splitTitle);
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
