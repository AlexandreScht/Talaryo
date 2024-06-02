import { cheerioResult } from '@interfaces/scrapping';
import { load } from 'cheerio';
import { Service } from 'typedi';

interface IndeedProps {
  salary: string;
  other: string[];
}

@Service()
export default class ScrapperServiceFile {
  public Indeed(content: string): cheerioResult[] {
    const $ = load(content);
    const data: any[] = [];
    $('li.css-5lfssm.eu4oa1w0').each((_, li) => {
      const link = $(li).find('a.jcs-JobTitle').attr('href');
      const jobName = $(li).find('span').first().text();
      const job_loc = $(li).find('div.company_location');
      const job_data = $(li).find('div.jobMetaDataGroup');
      const desc = job_loc.find('div.css-1p0sjhy.eu4oa1w0')?.text()?.split('à');

      const props: IndeedProps = { salary: '', other: [] };

      const getAllTextContent = (element: cheerio.Cheerio, data: IndeedProps) => {
        element.contents().each((_, child) => {
          const childNode = child as any;
          if (childNode.nodeType === 3) {
            const text = (childNode.nodeValue || '').trim();
            if (text) {
              data.other.push(text);
            }
          } else if (childNode.nodeType === 1) {
            const elem = $(childNode);
            if (elem.is('div')) {
              if (elem.hasClass('salary-snippet-container')) {
                data.salary = (elem.text() || '').trim();
              } else {
                getAllTextContent(elem, data);
              }
            }
          }
        });
      };

      if (job_data.length) {
        getAllTextContent(job_data, props);
      }

      if (link && jobName) {
        data.push({
          link,
          jobName,
          company: job_loc.find('span.css-92r8pb.eu4oa1w0')?.text()?.trim() ?? undefined,
          domicile: desc.length === 2 ? desc[0].trim() : undefined,
          loc: desc.length === 2 ? desc[1].trim() : desc[0] || undefined,
          ...props,
        });
      }
    });
    return data;
  }
}
