import { regionCode, regionLoc } from '@/utils/regionLoc';

function serializeLoc(loc: string, zone: boolean): string {
  const codeLoc = loc.substring(1, 3);
  const region = !zone ? regionCode[codeLoc].toLowerCase() : regionLoc[codeLoc].toLowerCase();
  return `"${!zone ? '*' : loc.split(':')[1].toLowerCase()},${region}"`;
}

export default serializeLoc;
