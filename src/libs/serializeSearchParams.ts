import * as selectMenuItems from '@/config/SelectMenuItems';
import { SelectDownItems } from '@/interfaces/components';

interface SelectMenuItems {
  [key: string]: SelectDownItems;
}

export default function serializeSearchParams(values: string[]): string[] {
  const menuItems: SelectMenuItems = selectMenuItems;
  return values
    .map((value) => {
      for (const groupKey in menuItems) {
        const group: SelectDownItems = menuItems[groupKey];

        const foundItem = group.itemsList.find((item) => item.name === value);

        if (foundItem) {
          return `${group.id}:${group.type || 'multiple'}:${value}`;
        }
      }
      return null;
    })
    .filter((item) => item !== null) as string[];
}
