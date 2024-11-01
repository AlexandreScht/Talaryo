import { SkipInTest } from '@/libs/decorators';
import axios from 'axios';
import pdf from 'pdf-parse';
import { pdfToPng } from 'pdf-to-png-converter';
import Tesseract from 'tesseract.js';
import { logger } from './logger';

export default async function pdfReader(url: string): Promise<{ pdf: false | Buffer; text?: string }> {
  const TIMEOUT = 15000;
  let timeoutId: NodeJS.Timeout;

  const fetchPdf = async (): Promise<{ pdf: false | Buffer; text?: string }> => {
    try {
      const { status, data } = await axios.get(url, { responseType: 'arraybuffer' });

      if (status !== 200) {
        return { pdf: undefined, text: undefined };
      }

      const response = await SkipInTest(
        async () => {
          return await pdf(data);
        },
        () => {
          if (data === 'Jest exeeded!') {
            return { text: '', numpages: 5 };
          }
          if (data === 'Jest no result') {
            return { text: '', numpages: 2 };
          }
          return { text: 'dataPage', numpages: 2 };
        },
      )();

      const { text, numpages } = response();

      if (![1, 2].includes(numpages)) {
        return { pdf: undefined, text: undefined };
      }

      if (!(text || text.trim()) && numpages <= 2) {
        const pngPages = await pdfToPng(data, {
          disableFontFace: false,
          useSystemFonts: false,
          enableXfa: false,
          viewportScale: 2.0,
          outputFileMask: 'buffer',
          pagesToProcess: [1, 2],
          strictPagesToProcess: false,
          verbosityLevel: 0,
        });

        const textImg = await pngPages?.reduce(async (accPromise, pngPage) => {
          const acc = await accPromise;
          const {
            data: { text: imgText },
          } = await Tesseract.recognize(pngPage.content, 'fra');
          if (imgText) {
            return acc + imgText;
          }
          return acc;
        }, Promise.resolve(''));

        return textImg ? { pdf: data, text: textImg } : { pdf: undefined, text: undefined };
      }

      return { pdf: data, text };
    } catch (error) {
      logger.error('pdfReader.fetchPdf =>', error);
      return { pdf: undefined, text: undefined };
    }
  };

  const timeout = new Promise<{ pdf: undefined; text: undefined }>(resolve => {
    timeoutId = setTimeout(() => {
      resolve({ pdf: undefined, text: undefined });
    }, TIMEOUT);
  });

  const result = await Promise.race([fetchPdf(), timeout]);

  clearTimeout(timeoutId);
  return result;
}
