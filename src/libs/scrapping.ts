import { boys, girls } from '@/utils/genderProfile';
import { Cheerio, CheerioAPI, Element } from 'cheerio';
import { getGender } from 'gender-detection-from-name';
import gender from 'gender-detection-ts';

export const noIntitle = ['Viadeo', 'Skiller', 'Dribble', 'Behance', 'Culinary agents', 'Dogfinance', 'Symfony'];

export const noSector = ['Culinary agents'];

export function GetPlatform(data: CheerioAPI): string {
  return data('div.N54PNb.BToiNc.cvP2Ce').find('img.XNo5Ab').attr('src');
}

export function GetElements(data: CheerioAPI): Cheerio<Element> {
  return data('div.N54PNb.BToiNc.cvP2Ce');
}

export function GetChips(data: CheerioAPI, element: Element): string[] | [] {
  const chip = [];
  if (data(element).children().length === 2) {
    data(element)
      .children()
      .eq(1)
      .find('span')
      .each((_, elem) => {
        const chipText = data(elem).text();
        if (chipText !== ' · ') {
          chip.push(chipText);
        }
      });
  }
  return chip;
}

export function GetProfileGenders(fullname: string) {
  try {
    const firstname = gender.getFirstName(fullname);
    if (!firstname) {
      return undefined;
    }
    const Gender1 = gender.detect(firstname, {
      useCount: true,
    });

    const Gender = Gender1 !== 'unknown' ? Gender1 : getGender(firstname);

    return Gender === 'female' ? girls[Math.floor(Math.random() * girls.length)] : boys[Math.floor(Math.random() * boys.length)];
  } catch (error) {
    console.log(error);
  }
}

export function GetGoogleInfos(data: CheerioAPI, element: Element) {
  const link = data(element).find('a[jsname="UWckNb"]').attr('href');
  const title = data(element).find('h3.LC20lb.MBeuO.DKV0Md').text();
  const desc = data(element).find('div.VwiC3b.yXK7lf').text();
  return { link, title, desc };
}
