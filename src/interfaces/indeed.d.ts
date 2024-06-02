import { contracts, graduation } from '.';

interface IndeedSearch {
  jobName: string;
  homeWork?: boolean;
  salary?: number;
  contract?: contracts;
  nightWork: boolean;
  graduation?: graduation[];
  loc?: string;
}
