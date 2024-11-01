import config from '@/config';
import OpenAI from 'openai';

export default async function ChatGPT(prompt: string, system?: string): Promise<string | undefined> {
  try {
    const openai = new OpenAI({
      apiKey: config.apiKey.GPT_KEY,
    });
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = system
      ? [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ]
      : [{ role: 'user', content: prompt }];

    const {
      choices: [
        {
          message: { content: apiChat },
        },
      ],
    } = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.2,
    });

    return serializeResponse(apiChat);
  } catch (error) {
    console.error('Error fetching ChatGPT response:', error);
    throw error;
  }
}

function serializeResponse(str?: string): string | undefined {
  if (!str) {
    return undefined;
  }
  const [jsonMatch] = str.match(/{.*}/s);
  if (jsonMatch) {
    const cleanedJson = cleanJsonString(jsonMatch);
    return cleanedJson.trim();
  }
  return undefined;
}

function cleanJsonString(jsonString: string): string {
  return jsonString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
}
