import { ServerException } from '@/exceptions';
import {
  ScrapeInfosResult,
  ScrappingSource,
  SourceFunction,
  cheerioInfos,
  cheerioResult,
  puppeteerProps,
  searchValues,
} from '@/interfaces/scrapping';
import { cvFinder, dateFinder } from '@/libs/regrex';
import { GetChips, GetElements, GetGoogleInfos, GetPlatform, GetProfileGenders } from '@/libs/scrapping';
import { normalizeString } from '@/utils/serializeString';
import { ApiPuppeteer } from '@utils/puppeteer';
import { load } from 'cheerio';
import { Service } from 'typedi';

@Service()
export class ScrapperServiceFile extends ApiPuppeteer {
  constructor() {
    super();
  }
  private shuffleArray(v: cheerioInfos[][]): cheerioInfos[] {
    const shuffleArr = [].concat(...v);
    for (let i = shuffleArr.length - 1; i > 0; i--) {
      const mixed = Math.floor(Math.random() * (i + 1));
      [shuffleArr[i], shuffleArr[mixed]] = [shuffleArr[mixed], shuffleArr[i]];
    }

    return shuffleArr;
  }

  private getFn(name: string): (value: string) => cheerioResult {
    const functionName: SourceFunction = {
      // reseaux Social
      LinkedIn: this.LinkedIn,
      Viadeo: this.Viadeo,
      Xing: this.Xing,
      //? reseaux special
      Batiactu: this.Batiactu,
      Dribble: this.Dribble,
      Behance: this.Behance,
      'Culinary agents': this.CulinaryAgents,
      Symfony: this.Symfony,
      //? Alumnis
      HEC: this.HEC,
      Polytechnique: this.Polytechnique,
      Ferrandi: this.Ferrandi,
      UTC: this.UTC,
      'Centrale Supélec': this.CentraleSupelec,
      'Centrale Lille': this.CentraleLille,
      Essec: this.Essec,
      Neoma: this.Neoma,
    };
    return functionName[name];
  }

  public async scrape(data: ScrappingSource[], { fn, industry }: searchValues): Promise<ScrapeInfosResult> {
    const values: puppeteerProps[] = data.map(v => ({ ...v, props: this.getFn(v.site), retryCount: 0, searchValues: { fn, industry } }));
    this.check(values);
    const [error, success] = await this.open(values);
    if (error) {
      throw new ServerException();
    }

    const number = success
      .filter(o => o.number)
      .reduce((acc, n) => {
        return (acc += n.number);
      }, 0);

    const result: cheerioInfos[][] = success
      .filter(o => o.data)
      .map(obj => {
        if (!obj.current) {
          return obj.data;
        }
        return obj.data.filter(v => v.currentCompany);
      });

    if (result.length === 1) {
      return { scrape: result[0], number: number || undefined };
    }

    return { scrape: this.shuffleArray(result), number: number || undefined };
  }

  // > ----------------------------------------------------------------------------------------------------------------------------------------------
  // TODO => Site pages
  // > ----------------------------------------------------------------------------------------------------------------------------------------------

  private LinkedIn(html: string, searchValues: searchValues): cheerioResult {
    //? ----- linkedIn logic -----
    const $ = load(html);
    const linkedIn: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const titleSeparator = title.split(' - ');
      const chip = GetChips($, element);

      const fullName = titleSeparator[0]?.toString()?.trim() || undefined;
      const currentJob =
        chip?.length > 2 ? chip[1].toString().trim() : titleSeparator?.length > 1 ? titleSeparator[1].toString().trim() : searchValues?.fn;
      const currentCompany =
        titleSeparator?.length > 2
          ? titleSeparator[2].toString().trim()
          : chip?.length > 1
          ? chip[chip.length - 1].toString().trim()
          : searchValues?.industry;

      const img = GetProfileGenders(fullName);

      linkedIn.push({
        platform,
        link,
        img,
        fullName,
        currentJob,
        currentCompany,
        desc: desc?.trim(),
      });
    }

    return linkedIn;
  }

  private Viadeo(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Viadeo logic -----
    const $ = load(html);
    const Viadeo: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      // name
      const nameMatch = title.match(/^(.*?)(?=\s\(|\s\-)/);
      const fullName = nameMatch[0] || undefined;
      // company
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
        // extract ()
        const matches = text.match(/\((.*?)(?=\)|$)/);
        if (!matches) {
          return { currentJob: searchValues?.fn, currentCompany: searchValues?.industry };
        }
        const data = matches[1];
        const extractedMatch = data.match(/^(.*?)(?= à)/);
        if (extractedMatch) {
          return { currentJob: searchValues?.fn, currentCompany: extractedMatch[0].trim() };
        }
        return { currentJob: searchValues?.industry, currentCompany: data.trim() };
      };
      const filterTitleCompanyB = (text: string) => {
        // extract -
        const currentCompanyPart = text
          .split(' - ')
          .slice(1)
          .filter(v => v !== 'Viadeo' && v !== 'JDN');
        return {
          currentJob: searchValues?.fn,
          currentCompany: currentCompanyPart.length ? currentCompanyPart[0].trim() : searchValues?.industry,
        };
      };

      const { currentJob, currentCompany } = filterTitleCompany(title) ? filterTitleCompanyA(title) : filterTitleCompanyB(title);
      const img = GetProfileGenders(fullName);
      Viadeo.push({ platform, link, img, fullName, currentJob, currentCompany, desc: desc?.trim() });
    }
    return Viadeo;
  }

  private Xing(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Xing logic -----
    const $ = load(html);
    const Xing: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const splitTitle = title.split(' - ');
      // name
      const fullName = splitTitle[0]?.trim() || undefined;
      // extract infos
      const extractInfos = (data: string[]) => {
        if (data.length === 3) {
          return { currentJob: data[1]?.trim(), currentCompany: data[2]?.trim() };
        }
        return { currentJob: data[1]?.trim(), currentCompany: searchValues?.industry };
      };
      const { currentJob, currentCompany } = extractInfos(splitTitle);
      const img = GetProfileGenders(fullName);
      Xing.push({ platform, link, img, fullName, currentJob, currentCompany, desc: desc?.trim() });
    }
    return Xing;
  }

  private Batiactu(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Batiactu logic -----
    const $ = load(html);
    const Batiactu: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const splitTitle = title.match(/\(([^)]+)(?:\)|\.{3})/);
      if (!splitTitle) {
        return;
      }
      const currentCompany = splitTitle[1]?.trim();
      const remainingText = title.split(splitTitle[0]);
      const fullName = remainingText[0]?.trim() || undefined;
      const img = GetProfileGenders(fullName);
      Batiactu.push({ platform, link, img, fullName, currentJob: searchValues?.fn, currentCompany, desc: desc?.trim() });
    }
    return Batiactu;
  }

  private Dribble(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Dribble logic -----
    const $ = load(html);
    const Dribble: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const img = GetProfileGenders(title);
      Dribble.push({
        platform,
        link,
        img,
        fullName: title || undefined,
        currentJob: searchValues?.fn,
        currentCompany: searchValues?.industry,
        desc: desc?.trim(),
      });
    }
    return Dribble;
  }

  private Behance(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Behance logic -----
    const $ = load(html);
    const Behance: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const splitTitle = title.split(' on Behance');
      const fullName = splitTitle[0]?.trim() || undefined;
      const img = GetProfileGenders(fullName);
      Behance.push({ platform, link, img, fullName, currentJob: searchValues?.fn, currentCompany: searchValues?.industry, desc: desc?.trim() });
    }
    return Behance;
  }

  private CulinaryAgents(html: string, searchValues: searchValues): cheerioResult {
    //? ----- CulinaryAgents logic -----
    const $ = load(html);
    const CulinaryAgents: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const splitTitle = title.split("'s professional profile");
      const fullName = splitTitle[0]?.trim() || undefined;
      const img = GetProfileGenders(fullName);
      CulinaryAgents.push({
        platform,
        link,
        img,
        fullName,
        currentJob: searchValues?.fn,
        currentCompany: searchValues?.industry,
        desc: desc?.trim(),
      });
    }
    return CulinaryAgents;
  }

  private Symfony(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Symfony logic -----
    const $ = load(html);
    const Symfony: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const matchTitle = title.match(/^(.*)\s+a\.k\.a\./);
      const fullName = matchTitle && matchTitle[1] ? matchTitle[1]?.trim() : title?.trim() || undefined;
      const img = GetProfileGenders(fullName);
      Symfony.push({ platform, link, img, fullName, currentJob: searchValues?.fn, currentCompany: searchValues?.industry, desc: desc?.trim() });
    }
    return Symfony;
  }

  private HEC(html: string, searchValues: searchValues): cheerioResult {
    //? ----- HEC logic -----
    const $ = load(html);
    const HEC: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);

      const extractInfos = (text: string) => {
        const parts = text
          .replace(/ - Resume/g, '')
          .replace(/ - CV_/g, ' - ')
          .replace(/ - CV(\s\.\.\.)?/g, ' - ')
          .replace(/\d+\s+page\s+\w+\s+\d{4}$/g, '')
          .split(' - ')
          .filter(v => v);
        if (parts?.length <= 1) {
          return { fullName: undefined };
        }
        const filteredParts = parts.filter(part => !/\bHEC \d{4}\b/.test(part));
        const matchedParts = parts.filter(part => /\bHEC \d{4}\b/.test(part));
        const reorderedParts = filteredParts.concat(matchedParts);

        const equalityMatch = (arr: string[]) => {
          const trimmedStr1 = arr[0].trim().replace(/\s+/g, '_');
          const trimmedStr2 = arr[1].trim().replace(/\s+/g, '_');
          if (trimmedStr2 === trimmedStr1) {
            return undefined;
          }
          return arr[1].trim();
        };

        const testStartsWith = (arr: string[]) => {
          const lowerStr1 = normalizeString(arr[0]);
          const lowerStr2 = normalizeString(arr[1]);

          if (lowerStr2.startsWith(lowerStr1)) {
            return undefined;
          }
          return arr[1].trim();
        };

        if (reorderedParts.length > 2) {
          return {
            fullName: reorderedParts[0]?.trim(),
            currentCompany: equalityMatch(reorderedParts),
            diplome: reorderedParts[reorderedParts.length - 1]?.trim(),
          };
        }
        return {
          fullName: reorderedParts[0]?.trim(),
          currentCompany: undefined,
          diplome: testStartsWith(reorderedParts),
        };
      };

      const { fullName, diplome, currentCompany } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        HEC.push({ platform, link, img, fullName, diplome, currentCompany: currentCompany || searchValues?.industry, desc: desc?.trim() });
      }
    }
    return HEC;
  }

  private Polytechnique(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Polytechnique logic -----
    const $ = load(html);
    const Polytechnique: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const extractInfos = (text: string) => {
        const filteredTitle = text.replace(/ - Resume/g, '').replace(cvFinder, '');
        const partFiltered = filteredTitle.split(' | ');
        if (partFiltered?.length > 1) {
          const [fullName, diplome] = partFiltered[0].split(' - ');
          return { fullName, diplome };
        }

        const [fullName, other] = filteredTitle.split(' - ');
        if (other.startsWith('Polytechnique')) {
          return { fullName, currentJob: other };
        }
        return { fullName, diplome: other };
      };
      const { fullName, diplome, currentJob } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        Polytechnique.push({
          platform,
          link,
          img,
          fullName,
          diplome,
          currentJob: currentJob || searchValues?.fn,
          currentCompany: searchValues?.industry,
          desc: desc?.trim(),
        });
      }
    }
    return Polytechnique;
  }
  private Ferrandi(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Ferrandi logic -----
    const $ = load(html);
    const Ferrandi: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const extractInfos = (text: string) => {
        const [fullName, diplome, currentJob] = text.split(' - ').filter(part => !/CV\s*/g.test(part));
        return { fullName, diplome, currentJob };
      };
      const { fullName, diplome, currentJob } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        Ferrandi.push({
          platform,
          link,
          img,
          fullName,
          diplome,
          currentJob: currentJob || searchValues?.fn,
          currentCompany: searchValues?.industry,
          desc: desc?.trim(),
        });
      }
    }
    return Ferrandi;
  }

  // private AIX_Polytech(html: string, searchValues: searchValues): cheerioResult {
  //   //? ----- AIX_Polytech logic -----
  //   const $ = load(html);
  //   const AIX_Polytech: cheerioResult = [];

  //   const platform = GetPlatform($);
  //   const elements = GetElements($);
  //   for (let i = 0; i < elements.length; i++) {
  //     const element = elements[i];

  //     const { link, title, desc } = GetGoogleInfos($, element);
  //     const extractInfos = (text: string) => {
  //       const customTitle = text.split(' - ').filter(part => !/CV\s*/g.test(part));
  //       if (customTitle.length < 2) {
  //         return { fullName: undefined };
  //       }
  //       const [firstPart, secondPart] = customTitle;
  //     };
  //     const { fullName, currentJob } = extractInfos(title);
  //     if (fullName) {
  //       AIX_Polytech.push({ platform, link, img: null, fullName, currentJob, currentCompany: searchValues?.industry, desc: desc?.trim() });
  //     }
  //   }
  //   return AIX_Polytech;
  // }

  private UTC(html: string, searchValues: searchValues): cheerioResult {
    //? ----- UTC logic -----
    const $ = load(html);
    const UTC: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const extractInfos = (text: string) => {
        const splitTitle = text.split(' - ');
        if (splitTitle.length > 2) {
          const extractJob = (currentJob: string, fullName: string) => {
            const normalJob = normalizeString(currentJob);
            const normalName = normalizeString(fullName);

            if (normalJob.includes(normalName.replace('_', ''))) {
              const updatedJob = normalJob.replace(new RegExp(normalName.replace('_', '') + '(_)?', 'i'), '').trim();
              return updatedJob?.trim();
            }
            return currentJob?.trim();
          };
          const [fullName, diplome, currentJob] = splitTitle.filter(part => !/CV[_ ]/g.test(part));
          return { fullName: fullName?.trim(), diplome: diplome?.trim(), currentJob: currentJob ? extractJob(currentJob, fullName) : undefined };
        }
        if (/ \| UTC Alumni/.test(text)) {
          const infoPart = text
            .replace(/CV\s*/g, '')
            .split(' | ')
            .filter(part => !part.startsWith('UTC Alumni'))[0];
          const extractPart = infoPart.split(' - ');
          if (extractPart?.length === 2) {
            const [fullName, diplome] = extractPart;
            return { fullName: fullName?.trim(), diplome: diplome?.trim() };
          }
          const [fullName, currentJob] = infoPart.split('/');
          return { fullName: fullName?.trim(), currentJob: currentJob?.trim() };
        }
        if (splitTitle.length === 2) {
          const filteredParts = splitTitle.filter(part => !/\UTC \d{4}\b/.test(part)).map(part => part.replace(cvFinder, ''));
          const matchedParts = splitTitle.filter(part => /\UTC \d{4}\b/.test(part));
          const reorderedParts = filteredParts.concat(matchedParts);
          return { fullName: reorderedParts[0]?.trim(), diplome: reorderedParts[1]?.trim() };
        }
        return { fullName: undefined };
      };
      const { fullName, diplome, currentJob } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        UTC.push({ platform, link, img, fullName, diplome, currentJob, currentCompany: searchValues?.industry, desc: desc?.trim() });
      }
    }
    return UTC;
  }

  private CentraleSupelec(html: string, searchValues: searchValues): cheerioResult {
    //? ----- CentraleSupelec logic -----
    const $ = load(html);
    const CentraleSupelec: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const extractInfos = (text: string) => {
        const parts = text
          .replace(/ - CV(\s\.\.\.)?/g, ' - ')
          .split(' - ')
          .filter(v => v)
          .map(v => v.replace(cvFinder, ' '));
        if (parts.length > 2) {
          const [fullName, diplome, ...currentJobList] = parts;
          const currentJob = currentJobList.join(' ');
          return { fullName: fullName?.trim(), diplome: diplome?.trim(), currentJob: currentJob?.trim() };
        }
        if (parts.length === 2) {
          const [fullName, diplome] = parts.sort((a, b) => (/\b\d{4}\b/.test(a) ? 1 : /\b\d{4}\b/.test(b) ? -1 : 0));
          return { fullName: fullName?.trim(), diplome: diplome?.trim() };
        }
        return { fullName: undefined };
      };
      const { fullName, diplome, currentJob } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        CentraleSupelec.push({
          platform,
          link,
          img,
          fullName,
          diplome,
          currentJob,
          currentCompany: searchValues?.industry,
          desc: desc?.trim(),
        });
      }
    }
    return CentraleSupelec;
  }

  private CentraleLille(html: string, searchValues: searchValues): cheerioResult {
    //? ----- CentraleLille logic -----
    const $ = load(html);
    const CentraleLille: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const extractInfos = (text: string) => {
        const parts = text.replace(dateFinder, '').split(' - ');
        if (parts.length === 2) {
          const processArray = (array: string[]) => {
            return array.flatMap(string =>
              string.startsWith('CV') ? (string.match(/^CV\s+(\w+\s+\w+)\s+(.*)$/) ? [RegExp.$1, RegExp.$2] : string) : string,
            );
          };
          const filteredArray = processArray(parts)
            .map(v => v.replace(cvFinder, '').replace(/CV-/, ''))
            .sort((a, b) => (/\b\d{4}\b/.test(a) ? 1 : /\b\d{4}\b/.test(b) ? -1 : 0));

          if (filteredArray.length === 3) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [fullName, _, diplome] = filteredArray;
            return {
              fullName: fullName?.trim(),
              diplome: diplome?.trim(),
            };
          }
          const [fullName, diplome] = filteredArray;
          return { fullName: fullName?.trim(), diplome: diplome?.trim() };
        }
        if (parts.length > 2) {
          const [fullName, diplome, currentJob] = parts.map(v => v.replace(cvFinder, '').replace(/CV-/, '')).filter(v => v && v?.trim() !== '...');
          return { fullName: fullName?.trim(), diplome: diplome?.trim(), currentJob: currentJob?.trim() };
        }
        return { fullName: undefined };
      };
      const { fullName, diplome, currentJob } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        CentraleLille.push({
          platform,
          link,
          img,
          fullName,
          diplome,
          currentJob,
          currentCompany: searchValues?.industry,
          desc: desc?.trim(),
        });
      }
    }
    return CentraleLille;
  }

  private Essec(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Essec logic -----
    const $ = load(html);
    const Essec: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const extractInfos = (text: string) => {
        const parts = text.replace(/ - Resume/g, '').split(' - ');
        if (parts.length > 2) {
          const [firstPart, secondPart, ...lastPart] = parts;
          const groupedPart = lastPart.join(' ');

          const filteredParts = [firstPart, secondPart, groupedPart]
            .sort((a, b) => (/\ESSEC \d{4}\b/.test(a) ? 1 : /\ESSEC \d{4}\b/.test(b) ? -1 : 0))
            .filter((v, i) => v && (i !== 1 || !v.startsWith('ESSEC ')) && !v.startsWith('CV_ ') && !v.startsWith('CV '));
          if (filteredParts.length === 3) {
            const [fullName, currentJob, diplome] = filteredParts;
            return {
              fullName: fullName?.trim(),
              diplome: diplome?.trim(),
              currentJob: currentJob?.trim(),
            };
          }
          const [fullName, diplome] = filteredParts;
          return {
            fullName: fullName?.trim(),
            diplome: diplome?.trim(),
            currentJob: undefined,
          };
        }
        if (parts.length === 2) {
          const [fullName, diplome] = parts
            .sort((a, b) => (/\ESSEC \d{4}\b/.test(a) ? 1 : /\ESSEC \d{4}\b/.test(b) ? -1 : 0))
            .map(v => v.replace(cvFinder, ''))
            .filter(v => v);
          return { fullName: fullName?.trim(), diplome: diplome?.trim() };
        }
        return { fullName: undefined };
      };
      const { fullName, diplome, currentJob } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        Essec.push({
          platform,
          link,
          img,
          fullName,
          diplome,
          currentJob,
          currentCompany: searchValues?.industry,
          desc: desc?.trim(),
        });
      }
    }
    return Essec;
  }

  private Neoma(html: string, searchValues: searchValues): cheerioResult {
    //? ----- Neoma logic -----
    const $ = load(html);
    const Neoma: cheerioResult = [];

    const platform = GetPlatform($);
    const elements = GetElements($);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const { link, title, desc } = GetGoogleInfos($, element);
      const extractInfos = (text: string) => {
        const parts = text.split(' - ');
        if (parts.length === 1) {
          const [fullName] = parts.filter(v => v.startsWith('CV ')).map(v => v.replace('CV de', '').replace(cvFinder, ' '));
          return { fullName: fullName?.trim() };
        }
        if (parts.length === 2) {
          const [fullName, diplome] = parts
            .sort((a, b) => (/\NEOMA \d{4}\b/.test(a) ? 1 : /\NEOMA \d{4}\b/.test(b) ? -1 : 0))
            .map(v => v.replace(cvFinder, ''))
            .filter(v => v);
          const splitName = fullName.split(' ');
          if (splitName.length > 2) {
            return {
              fullName: splitName.splice(0, 2).join(' ')?.trim(),
              diplome: diplome?.trim(),
              currentJob: splitName.join(' ')?.trim(),
            };
          }
          return { fullName: fullName?.trim(), diplome: diplome?.trim() };
        }
        if (parts.length > 2) {
          const [firstPart, secondPart, ...lastPart] = parts;
          const groupedPart = lastPart.join(' ');

          const filteredParts = [firstPart, secondPart, groupedPart]
            .sort((a, b) => (/\NEOMA \d{4}\b/.test(a) ? 1 : /\NEOMA \d{4}\b/.test(b) ? -1 : 0))
            .filter(v => v && !v.startsWith('CV') && !v.startsWith('CV ') && !v.startsWith('CV-') && !v.startsWith('CV_'));
          if (filteredParts.length === 3) {
            const [fullName, currentJob, diplome] = filteredParts;
            return {
              fullName: fullName?.trim(),
              diplome: diplome?.trim(),
              currentJob: currentJob?.trim(),
            };
          }
          const [fullName, diplome] = filteredParts;
          return {
            fullName: fullName?.trim(),
            diplome: diplome?.trim(),
            currentJob: undefined,
          };
        }
      };
      const { fullName, diplome, currentJob } = extractInfos(title);
      if (fullName) {
        const img = GetProfileGenders(fullName);
        Neoma.push({
          platform,
          link,
          img,
          fullName,
          diplome,
          currentJob,
          currentCompany: searchValues?.industry,
          desc: desc?.trim(),
        });
      }
    }
    return Neoma;
  }

  // > ----------------------------------------------------------------------------------------------------------------------------------------------
  // Todo => CV Page
  // > ----------------------------------------------------------------------------------------------------------------------------------------------
}

export default ScrapperServiceFile;
