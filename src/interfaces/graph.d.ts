interface monthSelector {
  value: number;
  name: string;
}
interface onlyDateSelect {
  year: number;
  month: number;
}
interface dateSelect {
  year: number;
  month: number;
  monthName: string;
}
type dateRange = {
  dateA: dateSelect;
  dateB?: dateSelect;
};

interface DateProps {
  choose: dateSelect | undefined;
  rangeChoose: dateRange | undefined;
}

interface isOpen {
  open: boolean;
  range: boolean;
  date: boolean;
}

export type labelType = 'day' | 'month' | 'year';

interface graphXLabel {
  yyyy: number;
  mm: number;
  dd: number;
  label: string;
}
