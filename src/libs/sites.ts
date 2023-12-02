import config from '@/config';
import { InvalidArgumentError } from '@/exceptions';

function sitesUri(s: string): string {
  const { sites } = config;
  const str = sites[s];
  if (!str) {
    throw new InvalidArgumentError(`the website << ${s} >> is not allowed !`);
  }
  return str;
}

export default sitesUri;
