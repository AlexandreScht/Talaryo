import { platformsBusiness, platformsPro, ROLE_CV_SEARCH_LIMIT, ROLE_MAIL_FOUND_LIMIT, ROLE_SEARCH_LIMIT } from '@/config/access';
import { InvalidArgumentError, InvalidRoleAccessError, ServerException } from '@/exceptions';
import { candidateScrapingForm, cvScrapingForm, cvStrategiesResult, platforms } from '@/interfaces/scrapping';
import { SkipInTest } from '@/libs/decorators';
import { noIntitle, noSector } from '@/libs/scrapping';
import StreamManager from '@/libs/streamManager';
import sitesUri from '@/middlewares/sites';
import ApiServiceFile from '@/services/api';
import FavorisServiceFile from '@/services/favoris';
import MongoServiceFile from '@/services/mongo';
import ScoreServiceFile from '@/services/scores';
import ScrapperServiceFile from '@/strategys/scrapper';
import signedPDF from '@/utils/customPDF';
import { logger } from '@/utils/logger';
import pdfReader from '@/utils/pdfReader';
import { serializeLoc } from '@/utils/serializer';
import {
  ControllerMethods,
  ExpressHandler,
  ScrappingControllerCandidate,
  ScrappingControllerCv,
  ScrappingControllerCvContent,
  ScrappingControllerGetPersonalDetails,
} from '@interfaces/controller';
import MemoryServerCache from '@libs/memoryCache';
import Container from 'typedi';

export default class ScrappingController implements ControllerMethods<ScrappingController> {
  private ScoreService: ScoreServiceFile;
  private FavorisService: FavorisServiceFile;
  private ScrapperService: ScrapperServiceFile;
  private ApiService: ApiServiceFile;
  private MongoService: MongoServiceFile;
  private MemoryServer: MemoryServerCache;

  constructor() {
    this.ScoreService = Container.get(ScoreServiceFile);
    this.FavorisService = Container.get(FavorisServiceFile);
    this.ScrapperService = Container.get(ScrapperServiceFile);
    this.ApiService = Container.get(ApiServiceFile);
    this.MongoService = Container.get(MongoServiceFile);
    this.MemoryServer = MemoryServerCache.getInstance();
  }

  //> private methods
  private async verifyAccess(sessionRole: role, sourcePlatform: platforms, sessionId: number) {
    if (sessionRole === 'admin') return;

    if (platformsPro.includes(sourcePlatform) && sessionRole === 'free') {
      throw new InvalidRoleAccessError(`Veuillez souscrire à un plan supérieur pour accéder à la plateforme : ${sourcePlatform}.`);
    }

    if (platformsBusiness.includes(sourcePlatform) && ['free', 'pro'].includes(sessionRole)) {
      throw new InvalidRoleAccessError(`Veuillez souscrire au plan business pour accéder à la plateforme : ${sourcePlatform}.`);
    }

    const { searches: totalSearches } = await this.ScoreService.getTotalMonthValues(sessionId, ['searches']);

    if (totalSearches >= ROLE_SEARCH_LIMIT[sessionRole]) {
      throw new InvalidRoleAccessError(`Limite de recherche mensuelle atteinte avec votre abonnement ${sessionRole.toUpperCase()}.`);
    }
  }

  private uriBuilder(queries: Omit<candidateScrapingForm, 'platform'>, sourcePlatform: platforms, loc?: string[], zone?: boolean) {
    return Object.entries(queries).reduce((acc, [key, value]) => {
      if (!value) return acc;

      const valuesArray = Array.isArray(value) ? value : [value];

      switch (key) {
        case 'fn': {
          const str = valuesArray.map(v => (noIntitle.includes(sourcePlatform) ? v : `intitle:${v}`));
          return `${acc} ${str.join(' | ')}`;
        }
        case 'industry': {
          const str = valuesArray.map(v => `inanchor:${v}`);
          return `${acc} ${str.join(' | ')}`;
        }
        case 'sector': {
          if (!noSector.includes(sourcePlatform)) {
            return `${acc} ${valuesArray.join(' | ')}`;
          }
          return acc;
        }
        case 'skill':
        case 'key': {
          return `${acc} ${valuesArray.join(' ')}`;
        }
        case 'Nindustry': {
          const str = valuesArray.map(v => `-inanchor:${v}`);
          return `${acc} ${str.join(' | ')}`;
        }
        case 'Nskill':
        case 'Nkey': {
          const str = valuesArray.map(v => `-${v}`);
          return `${acc} ${str.join(' | ')}`;
        }
        case 'loc': {
          return `${acc} ${serializeLoc(loc, zone)}`;
        }
        default: {
          return acc;
        }
      }
    }, sitesUri(sourcePlatform));
  }

  //; protected methods
  protected candidate: ExpressHandler<ScrappingControllerCandidate> = async ({
    locals: {
      query: { platform, fn, industry, sector, skill, key, loc, Nindustry, Nskill, Nkey, zone, start = 0, index = 50, time: current = true },
    },
    session: { sessionId, sessionRole },
    res,
    next,
  }) => {
    try {
      const queries = { fn, industry, sector, skill, key, loc, Nindustry, Nskill, Nkey };

      await this.verifyAccess(sessionRole, platform, sessionId);

      const searchUrl = this.uriBuilder(queries, platform, loc, zone);

      const url = `https://www.google.com/search?client=opera&q=${encodeURIComponent(searchUrl)}&start=${start}&num=${index}`;

      const { scrapeResult, total } =
        (await this.ScrapperService.scrapeCandidate({
          url,
          platform,
          current,
        })) || {};

      if (!scrapeResult || total < 1) {
        res.status(204).send();
        return;
      }

      const favMap = await this.FavorisService.userCandidateFavoris(sessionId);

      const links = scrapeResult.map(obj => ({
        ...obj,
        favFolderId: favMap.get(obj.link) || undefined,
      }));

      await this.ScoreService.improveScore(['searches'], 1, sessionId);

      res.send({ links, data: { start, index, total } });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('ScrappingController.candidate =>' + error);
      }

      next(error);
    }
  };

  protected cv: ExpressHandler<ScrappingControllerCv> = async ({
    locals: {
      query: {
        fn,
        date,
        matching,
        industry,
        formation,
        sector,
        skill,
        key,
        loc,
        Nindustry,
        Nkey,
        Nskill,
        zone,
        start = 0,
        index = 50,
        time: current = true,
      },
    },
    session: { sessionId, sessionRole },
    res,
    next,
  }) => {
    try {
      if (sessionRole !== 'admin') {
        const { cv: score } = await this.ScoreService.getTotalMonthValues(sessionId, ['cv']);
        const limits = ROLE_CV_SEARCH_LIMIT[sessionRole];
        if (score >= limits) {
          throw new InvalidRoleAccessError(`Limite de recherche mensuelle atteinte avec votre abonnement ${sessionRole.toUpperCase()}.`);
        }
      }

      const includeFields = { fn, industry, sector, skill, key, formation };
      const excludeFields = { Nindustry, Nskill, Nkey };
      const buildQueryPart = (fields: Record<string, string[]>, exclude = false) =>
        Object.values(fields)
          .filter(Boolean)
          .flatMap(val => val.map(v => v.trim().replace(/\s+/g, '-')))
          .map(v => `${exclude ? '-' : ''}${v}`)
          .join(' | ');

      const includeQuery = buildQueryPart(includeFields);
      const excludeQuery = buildQueryPart(excludeFields, true);

      const serializeDate = new Date(date).getUTCFullYear() - 1;
      const url = `ext:pdf | ext:doc | ext:docx | ext:ppt inurl:cv | inurl:curriculum | intitle:cv | intitle:curriculum after:${serializeDate} ${includeQuery} ${excludeQuery} ${
        loc ? serializeLoc(loc, zone) : ''
      }`;

      const streamOption = {
        ...includeFields,
        ...excludeFields,
        matching,
        time: current,
        zone,
        date: new Date(String(serializeDate)),
        loc,
      } as cvScrapingForm;

      const uri = `https://www.google.com/search?client=opera&q=${encodeURIComponent(url)}&start=${start}&num=${index}`;

      const result = await this.ScrapperService.scrapeCV(uri);

      if (!result) {
        res.status(204).send();
        return;
      }

      const { links: streamValues, total } = result;

      const favMap = await this.FavorisService.userCandidateFavoris(sessionId, true);

      const Stream: StreamManager = new StreamManager(sessionId);
      const { firstResult, ignored } =
        (await Stream.newStream<string, cvScrapingForm, cvStrategiesResult>({
          streamValues,
          streamOption,
          userId: sessionId,
          streamTask: 'cv',
          memoryValue: favMap,
        })) || {};

      if (!firstResult) {
        res.status(204).send();
        return;
      }

      await this.ScoreService.improveScore(['cv'], 1, sessionId);
      res.send({ firstResult, data: { start, index, total: total - ignored } });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('ScrappingController.cv =>' + error);
      }
      next(error);
    }
  };

  protected cv_content: ExpressHandler<ScrappingControllerCvContent> = async ({
    locals: {
      params: { link },
    },
    res,
    next,
  }) => {
    try {
      const { pdf } = await pdfReader(link);
      if (!pdf) {
        throw new InvalidArgumentError('Erreur lors du chargement du contenu du CV.');
      }

      const editedPDF = await signedPDF(pdf);
      res.send({ editedPDF });
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('ScrappingController.cv_content =>' + error);
      }
      next(error);
    }
  };

  protected get_personal_details: ExpressHandler<ScrappingControllerGetPersonalDetails> = async ({
    locals: {
      query: { firstName, lastName, company, link },
    },
    session: { sessionId, sessionRole },
    req,
    res,
    next,
  }) => {
    try {
      const { mails: mailScore } = await this.ScoreService.getTotalMonthValues(sessionId, ['mails']);
      if (mailScore >= ROLE_MAIL_FOUND_LIMIT[sessionRole]) {
        throw new InvalidRoleAccessError(`Limite mensuelle de recherche d'emails atteinte avec votre abonnement ${sessionRole.toUpperCase()}.`);
      }

      const fetchEmailData = async () => {
        const requestId = await this.ApiService.FetchMailRequestId({
          first_name: firstName,
          last_name: lastName.toLocaleUpperCase(),
          company,
        });
        const MAX_ATTEMPT = 10;
        const DELAY = SkipInTest(
          () => 5000,
          () => 10,
        )()();

        for (let attempt = 0; attempt < MAX_ATTEMPT; attempt++) {
          const email = await this.ApiService.FetchMailData(requestId);

          if (Array.isArray(email) && !!email[0]?.email) {
            return { email: email[0].email };
          }
          await new Promise(resolve => setTimeout(resolve, DELAY));
        }
        return undefined;
      };
      const jsonEmail = async () => {
        const json = await this.MongoService.personalData(firstName, lastName);
        if (!json) return;
        return { json };
      };

      const result = await Promise.allSettled([fetchEmailData(), ...(sessionRole === 'free' ? [] : [jsonEmail()])])
        .then(results => results.flatMap(result => (result.status === 'fulfilled' ? result.value : undefined)))
        .then(v => v.filter(v => v));

      if (result.length > 0) {
        await this.ScoreService.improveScore(['mails'], 1, sessionId);
        res.send({
          res: result.reduce((acc, v) => ({ ...acc, ...v }), {}),
        });
        return;
      }

      if (!link || sessionRole === 'free') {
        res.status(204).send();
        return;
      }
      //; signalHire
      const protocol = req.protocol;
      const host = req.get('host');

      const callbackUrl = `${protocol}://${host}/api`;
      const requestId = await this.ApiService.SendSignalHireRequest(link, callbackUrl);
      this.MemoryServer.setMemory(`signalHire.${requestId}`, { userId: sessionId, link });
      res.status(206).send();
    } catch (error) {
      if (!(error instanceof ServerException)) {
        logger.error('ScrappingController.get_personal_details =>' + error);
      }
      next(error);
    }
  };
}
