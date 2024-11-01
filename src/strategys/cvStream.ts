import type { cvScrapingForm, cvStrategiesResult } from '@/interfaces/scrapping';
import { cvStream } from '@/interfaces/stream';
import ChatGPT from '@/libs/openAI';
import { GetProfileGenders } from '@/libs/scrapping';
import pdfReader from '@/utils/pdfReader';

function generateString({ industry, Nindustry, zone, loc, skill, Nskill, Nkey, formation, sector, key, date, time: current }: cvScrapingForm) {
  const conditions = [
    industry && industry.length ? `Industries: ${current ? 'Current company must be in' : 'Must be mentioned in'}: ${industry.join(', ')}` : '',
    Nindustry && Nindustry.length ? `Excluded industries must not include: ${Nindustry.join(', ')}` : '',
    loc && loc.length ? `Location must be in: ${zone ? loc.join(', ') + 'city in France' : loc.join(', ') + 'région en France'}` : '',
    skill && skill.length ? `Skills must be mentioned in: ${skill.join(', ')}` : '',
    Nskill && Nskill.length ? `Excluded skills must not include: ${Nskill.join(', ')}` : '',
    Nkey && Nkey.length ? `Excluded keywords must not include: ${Nkey.join(', ')}` : '',
    formation && formation.length ? `Education must be mentioned in: ${formation.join(', ')}` : '',
    sector && sector.length ? `Sectors must be in: ${sector.join(', ')}` : '',
    key && key.length ? `Keywords must be mentioned in: ${key.join(', ')}` : '',
    date ? `Minimum cv date must be: ${date}` : '',
  ];

  const result = conditions
    .filter(condition => condition)
    .map((condition, index) => `${index + 1}. ${condition}`)
    .join('; ');

  return result;
}

export default async function serializeCvStream<V extends cvStrategiesResult | undefined | { system: string; prompt: string }>({
  link,
  cvScrapingForm,
  isTraining,
}: cvStream): Promise<V | undefined> {
  const { fn, matching } = cvScrapingForm || {};

  try {
    const { text } = await pdfReader(link);

    if (!text) {
      return undefined;
    }
    const system =
      'You are an assistant that extracts structured information from text about CV. Respond only with the extracted information in the specified JSON format, in French, without any additional explanation.';

    const condition = generateString(cvScrapingForm);
    const prompt = `Format JSON:
{
  fullName: string,
  resume: string,
  currentJob: string | null,
  currentCompany: string | null,
  matching: number
} | null
Instructions:
  - Replace types with values from the text below.
  - currentJob: actual job title searched in the text (it must be the searched one!).
  - currentCompany: actual company name, or null.
  - resume: summary of 20-25 words.
  - matching: display the matching adequacy percentage.
  - Calculate matching adequacy percentage with these criteria (if below ${matching || '50'}%, return only null):
  - If the CV Text is in other language than French, return only null (0% matching);
  ${
    fn && fn.length ? `- Current function must be in: ${fn.join(', ')}` : ''
  } if it doesn't match, return 0% matching (a global null). If it matches, this accounts for 50% of the matching score;
  ${!!condition ? `- Prioritize the following criteria in order of importance when calculating the matching score: ${condition}` : ''} 
  - Text:
  ${text}
  Respond in French.`;

    if (isTraining) {
      return { system, prompt } as V;
    }
    const aiMessage = await ChatGPT(prompt, system);

    if (!aiMessage) {
      return undefined;
    }
    try {
      const chatRes: cvStrategiesResult = JSON.parse(aiMessage);

      if (
        !chatRes ||
        !(
          chatRes.hasOwnProperty('fullName') &&
          typeof chatRes.fullName === 'string' &&
          chatRes.hasOwnProperty('resume') &&
          typeof chatRes.resume === 'string'
        )
      ) {
        return undefined;
      }

      return { ...chatRes, img: GetProfileGenders(chatRes.fullName), pdf: link } as V;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
