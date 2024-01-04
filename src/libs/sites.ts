import config from '@/config';
import { InvalidArgumentError } from '@/exceptions';

function sitesUri(site: string): string {
  const { sites } = config;
  const str = sites[site];
  if (!str) {
    throw new InvalidArgumentError(`the website << ${site} >> is not allowed !`);
  }
  return str;
}

export default sitesUri;
