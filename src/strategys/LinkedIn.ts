import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function LinkedIn(html: string): candidateStrategiesResult[] {
  try {
    const data = load(html);
    const elements = GetGoogleData(data, 'https://fr.linkedin.com/');

    return elements.reduce((acc: candidateStrategiesResult[], element) => {
      const { link, title, desc } = element;

      const titleSeparator = title.split(' - ');

      const fullName = titleSeparator[0]?.toString()?.trim() || undefined;
      const currentJob = titleSeparator?.length > 1 ? titleSeparator[1].toString().trim() : undefined;
      const currentCompany = titleSeparator?.length > 2 ? titleSeparator[2].toString().trim() : undefined;

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
  } catch (error) {
    console.log(error);
  }
}
