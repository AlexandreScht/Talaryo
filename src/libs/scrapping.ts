import { platformLinkSearch } from '@/interfaces/scrapping';
import { boys, girls } from '@/utils/genderProfile';
import { getGender } from 'gender-detection-from-name';
import gender from 'gender-detection-ts';
export const noIntitle = ['Viadeo', 'Skiller', 'Dribble', 'Behance', 'Culinary agents', 'Dogfinance', 'Symfony'];
export const noSector = ['Culinary agents'];

export function GetProfileGenders(fullname = '') {
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

function getDescription(element: cheerio.Cheerio) {
  const secondDivChild = element.children('div').eq(1);
  const childrenNotSpan = secondDivChild.children().not('span');
  const spanElement = childrenNotSpan.find('span');

  if (spanElement.length > 0) {
    return spanElement.text();
  } else if (secondDivChild.text().trim() !== '') {
    return secondDivChild.text().trim();
  }
  return '';
}

export function GetGoogleData(data: cheerio.Root, linkSearch: platformLinkSearch): { link: string; title: string; desc: string }[] {
  const links = data(`a[href^="${linkSearch}"]`);

  return links.toArray().reduce((results, linkElement) => {
    const link = data(linkElement);
    const parentPart = link.parents().eq(4);
    const title = link.find('h3').text();
    const desc = getDescription(parentPart);

    results.push({
      link: link.attr('href'),
      title: title?.trim(),
      desc: desc?.trim(),
    });

    return results;
  }, []);
}

//> cv

export function GetCvProps(data: cheerio.Root): { link: string }[] {
  const spans = data('span').filter(function () {
    return data(this).text().trim() === 'PDF';
  });

  return spans.toArray().reduce((results, linkElement) => {
    const span = data(linkElement);
    const titlePart = span.parents().eq(8);
    const link = titlePart.find('a');

    results.push({
      link: link.attr('href'),
    });
    return results;
  }, []);
}
