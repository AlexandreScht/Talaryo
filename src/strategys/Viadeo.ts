import { candidateStrategiesResult } from '@/interfaces/scrapping';
import { GetGoogleData, GetProfileGenders } from '@/libs/scrapping';
import { load } from 'cheerio';

export default function Viadeo(html: string): candidateStrategiesResult[] {
  const data = load(html);
  const elements = GetGoogleData(data, 'https://viadeo.journaldunet.com/');

  return elements.reduce((acc: candidateStrategiesResult[], element) => {
    const { link, title, desc } = element;
    //* name
    const nameMatch = title.match(/^(.*?)(?=\s\(|\s\-)/);
    const fullName = nameMatch[0] || undefined;
    //* company
    const filterTitleCompany = (text: string) => {
      const firstParenthesisIndex = text.indexOf(' (');
      const firstHyphenIndex = text.indexOf(' - ');

      if (firstHyphenIndex === -1) {
        return true;
      }

      if (firstParenthesisIndex === -1) {
        return false;
      }

      return firstParenthesisIndex !== -1 && firstHyphenIndex !== -1 && firstParenthesisIndex < firstHyphenIndex;
    };

    const filterTitleCompanyA = (text: string) => {
      //* extract ()
      const matches = text.match(/\((.*?)(?=\)|$)/);
      if (!matches) {
        return { currentJob: undefined, currentCompany: undefined };
      }
      const data = matches[1];
      const extractedMatch = data.match(/^(.*?)(?= à)/);
      if (extractedMatch) {
        return { currentJob: undefined, currentCompany: extractedMatch[0].trim() };
      }
      return { currentJob: undefined, currentCompany: data.trim() };
    };
    const filterTitleCompanyB = (text: string) => {
      //* extract -
      const currentCompanyPart = text
        .split(' - ')
        .slice(1)
        .filter(v => v !== 'Viadeo' && v !== 'JDN');
      return {
        currentJob: undefined,
        currentCompany: currentCompanyPart.length ? currentCompanyPart[0].trim() : undefined,
      };
    };

    const { currentJob, currentCompany } = filterTitleCompany(title) ? filterTitleCompanyA(title) : filterTitleCompanyB(title);
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
