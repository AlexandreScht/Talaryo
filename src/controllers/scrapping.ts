import { ScrappingSource, sources } from '@/interfaces/scrapping';
import serializeLoc from '@/libs/serializeLoc';
import sitesUri from '@/libs/sites';
import auth from '@/middlewares/auth';
import FavorisServiceFile from '@/services/favoris';
import ScrapperServiceFile from '@/services/scrapper';
import { numberValidator, stringValidator } from '@libs/validate';
import mw from '@middlewares/mw';
import validator from '@middlewares/validator';
import Container from 'typedi';

const ScrappingController = ({ app }) => {
  const ScrapperServices = Container.get(ScrapperServiceFile);
  const FavorisServices = Container.get(FavorisServiceFile);
  app.get(
    '/scrapping',
    mw([
      auth(),
      validator({
        query: {
          platform: stringValidator.required(),
          fn: stringValidator,
          industry: stringValidator,
          sector: stringValidator,
          skill: stringValidator,
          key: stringValidator,
          loc: stringValidator,
          Nindustry: stringValidator,
          Nskill: stringValidator,
          Nkey: stringValidator,
          time: stringValidator,
          zone: stringValidator,
          start: numberValidator,
          index: numberValidator,
        },
      }),
      async ({
        locals: {
          query: { platform, fn, industry, sector, skill, key, loc, Nindustry, Nskill, Nkey, time, zone, index = 50, start = 0 },
        },
        session: { sessionId },
        res,
        next,
      }) => {
        try {
          const Searches: ScrappingSource[] = [];
          const queries = { fn, industry, sector, skill, key, loc, Nindustry, Nskill, Nkey };
          const sources: sources[] = platform.split(',');

          sources.forEach((s: sources) => {
            const url = Object.keys(queries).reduce((acc, key) => {
              if (!queries[key]) {
                return acc;
              }
              if (key === 'fn') {
                const str = queries[key].split(',').map((v: string) => `intitle:${v.replaceAll(' ', '-')}`);
                return (acc += ` ${str.join(' | ')}`);
              }
              if (key === 'industry') {
                const str = queries[key].split(',').map((v: string) => `inanchor:${v.replaceAll(' ', '-')}`);
                return (acc += ` ${str.join(' | ')}`);
              }
              if (key === 'skill' || key === 'key') {
                const str = queries[key].split(',').map((v: string) => v.replaceAll(' ', '-'));
                return (acc += ` ${str.join('&')}`);
              }
              if (key === 'sector') {
                const str = queries[key].split(',').map((v: string) => v.replaceAll(' ', '-'));
                return (acc += ` ${str.join(' | ')}`);
              }
              if (key === 'Nindustry') {
                const str = queries[key].split(',').map((v: string) => `-inanchor:${v.replaceAll(' ', '-')}`);
                return (acc += ` ${str.join(' | ')}`);
              }
              if (key === 'Nskill' || key === 'Nkey') {
                const str = queries[key].split(',').map((v: string) => `-${v.replaceAll(' ', '-')}`);
                return (acc += ` ${str.join(' | ')}`);
              }
              if (key === 'loc') {
                return (acc += ` ${serializeLoc(loc, zone)}`);
              }
              return acc;
            }, sitesUri(s));

            Searches.push({
              url: `https://www.google.com/search?client=opera&q=${encodeURIComponent(url)}&start=${start}&num=${index}`,
              site: s,
              current: time ?? false,
            });
          });

          const result = await ScrapperServices.scrape(Searches);
          const favMap = await FavorisServices.findAllUserFav(sessionId, result.scrape);
          const links = result.scrape.map(obj => ({
            ...obj,
            favFolderId: favMap.get(obj.link) || undefined,
          }));

          res.send({ res: links, data: { start, index, number: result.number } });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default ScrappingController;
