import type { cvScrapingForm } from './scrapping';

type streamTask = 'cv';

interface taskProps {
  task: streamTask;
}

interface processData<T, V> {
  firstResult: V | undefined;
  ignored: number;
  remainingValues: T[];
}

interface cvStream {
  link: string;
  cvScrapingForm: cvScrapingForm;
  isTraining?: true;
}
