import { ScrappingSource, sources } from '@/interfaces/scrapping';
import serializeLoc from '@/libs/serializeLoc';
import sitesUri from '@/libs/sites';
import auth from '@/middlewares/auth';
import FavorisServiceFile from '@/services/favoris';
import ScoreServiceFile from '@/services/scores';
import ScrapperServiceFile from '@/services/scrapper';
import { numberValidator, stringValidator } from '@libs/validate';
import mw from '@middlewares/mw';
import validator from '@middlewares/validator';
import Container from 'typedi';

const ScrappingController = ({ app }) => {
  const ScrapperServices = Container.get(ScrapperServiceFile);
  const FavorisServices = Container.get(FavorisServiceFile);
  const ScoreServices = Container.get(ScoreServiceFile);
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
          console.log(platform);

          sources.forEach((site: sources) => {
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
            }, sitesUri(site));

            Searches.push({
              url: `https://www.google.com/search?client=opera&q=${encodeURIComponent(url)}&start=${start}&num=${index}`,
              site,
              current: time ?? false,
            });
          });

          const result = await ScrapperServices.scrape(Searches);
          const favMap = await FavorisServices.findAllUserFav(sessionId, result.scrape);
          const links = result.scrape.map(obj => ({
            ...obj,
            favFolderId: favMap.get(obj.link) || undefined,
          }));

          if (result.number > 0) {
            const currentDate = new Date();
            await ScoreServices.improveSearchScore(
              { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate(), searches: 1 },
              sessionId,
            );
          }

          res.send({ res: links, data: { start, index, number: result.number } });
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default ScrappingController;
