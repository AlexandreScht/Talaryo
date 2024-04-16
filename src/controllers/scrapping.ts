import { sourcesBusiness, sourcesPro, totalMailFind, totalSearch } from '@/config/access';
import { InvalidRoleAccessError } from '@/exceptions';
import { ScrappingSource, sources } from '@/interfaces/scrapping';
import { noIntitle, noSector } from '@/libs/scrapping';
import serializeLoc from '@/libs/serializeLoc';
import sitesUri from '@/libs/sites';
import auth from '@/middlewares/auth';
import ApiServiceFile from '@/services/api';
import FavorisServiceFile from '@/services/favoris';
import ScoreServiceFile from '@/services/scores';
import ScrapperServiceFile from '@/services/scrapper';
import { booleanValidator, keyValidator, numberValidator, stringValidator } from '@libs/validate';
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
          platform: keyValidator.required(),
          fn: keyValidator,
          industry: keyValidator,
          sector: keyValidator,
          skill: keyValidator,
          key: keyValidator,
          loc: keyValidator,
          Nindustry: keyValidator,
          Nskill: keyValidator,
          Nkey: keyValidator,
          time: booleanValidator,
          zone: keyValidator,
          start: numberValidator,
          index: numberValidator,
        },
      }),
      async ({
        locals: {
          query: { platform, fn, industry, sector, skill, key, loc, Nindustry, Nskill, Nkey, time, zone, index = 50, start = 0 },
        },
        session: { sessionId, sessionRole },
        res,
        next,
      }) => {
        try {
          const Searches: ScrappingSource[] = [];
          const queries = { fn, industry, sector, skill, key, loc, Nindustry, Nskill, Nkey };
          const sources: sources[] = platform.split(',');
          if (sessionRole !== 'admin') {
            if (sources.some(s => sourcesPro.includes(s)) && sessionRole === 'free') {
              const notAllowedSite = sources.find(s => sourcesPro.includes(s));
              throw new InvalidRoleAccessError(`Veuillez souscrire à un plan supérieur pour accéder à : ${notAllowedSite}.`);
            }
            if (sources.some(s => sourcesBusiness.includes(s)) && ['free', 'pro'].includes(sessionRole)) {
              const notAllowedSite = sources.find(s => sourcesPro.includes(s));
              throw new InvalidRoleAccessError(`Veuillez souscrire au plan business pour accéder à : ${notAllowedSite}.`);
            }
            const total = await ScoreServices.getTotalMonthSearches(sessionId);
            console.log(total);

            if (sessionRole === 'free' && total >= totalSearch.free) {
              throw new InvalidRoleAccessError('Limite de recherche mensuelle atteinte avec votre abonnement FREE.');
            }
            if (sessionRole === 'pro' && total >= totalSearch.pro) {
              throw new InvalidRoleAccessError('Limite de recherche mensuelle atteinte avec votre abonnement PRO.');
            }
            if (sessionRole === 'business' && total >= totalSearch.business) {
              throw new InvalidRoleAccessError('Limite de recherche mensuelle atteinte.');
            }
          }

          sources.forEach((site: sources) => {
            const url = Object.keys(queries).reduce((acc, key) => {
              if (!queries[key]) {
                return acc;
              }
              if (key === 'fn') {
                const str = queries[key]
                  .split(',')
                  .map((v: string) => (noIntitle.includes(site) ? v.replaceAll(' ', '-') : `intitle:${v.replaceAll(' ', '-')}`));
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
              if (key === 'sector' && !noSector.includes(site)) {
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

          const result = await ScrapperServices.scrape(Searches, { fn, industry });

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
  app.get(
    '/mailer-scrape',
    mw([
      auth(),
      validator({
        query: {
          firstName: stringValidator.required(),
          lastName: stringValidator.required(),
          industry: stringValidator.required(),
        },
      }),
      async ({
        locals: {
          query: { firstName, lastName, industry },
        },
        session: { sessionId, sessionRole },
        res,
        next,
      }) => {
        try {
          const canFetchMail = async () => {
            const total = await ScoreServices.getTotalMonthMail(sessionId);
            if (sessionRole !== 'admin') {
              if (sessionRole === 'free' && total >= totalMailFind.free) {
                throw new InvalidRoleAccessError("Limite mensuelle de recherche d'emails atteinte avec votre abonnement FREE.");
              }
              if (sessionRole === 'pro' && total >= totalMailFind.pro) {
                throw new InvalidRoleAccessError("Limite mensuelle de recherche d'emails atteinte avec votre abonnement PRO.");
              }
              if (sessionRole === 'business' && total >= totalMailFind.business) {
                throw new InvalidRoleAccessError('Limite mensuelle maximale de recherche de mails atteinte.');
              }
            }
          };
          await canFetchMail();
          const apiService = Container.get(ApiServiceFile);
          const requestId = await apiService.FetchMailRequestId({
            first_name: firstName,
            last_name: lastName.toLocaleUpperCase(),
            company: industry,
          });

          const MAX_TRY = 5;
          for (let i = 0; i < MAX_TRY; i++) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            const [find, email] = await apiService.FetchMailData(requestId);

            if (find && !!email[0]?.email) {
              await canFetchMail();
              const currentDate = new Date();
              await ScoreServices.improveMailScore(
                { year: currentDate.getFullYear(), month: currentDate.getMonth() + 1, day: currentDate.getDate(), mails: 1 },
                sessionId,
              );
              return res.send({ res: email[0].email });
            }
            if (i === MAX_TRY - 1) {
              return res.send({ res: null });
            }
          }
        } catch (error) {
          next(error);
        }
      },
    ]),
  );
};
export default ScrappingController;
