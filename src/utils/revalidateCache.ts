'use server';

import { revalidatePath } from 'next/cache';

export default async function revalidatePaths(paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path, 'page');
    } catch (error) {
      console.error(`error on refresh catch in path : ${path}`);
      console.error(error);
    }
  }
}
