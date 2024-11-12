'use client';

import { DateProps, dateSelect, isOpen } from '@/interfaces/graph';
import { userPayload } from '@/interfaces/users';
import cn from '@/utils/cn';
import {
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from '@nextui-org/react';
import { useCallback, useMemo } from 'react';
import { RiArrowUpSFill } from 'react-icons/ri';

const Calendar = ({
  User,
  selectYear,
  setSelectYear,
  actualYearNumber,
  actualMonthNumber,
  actualMonthName,
  dateSelect,
  setDateSelect,
  isOpen,
  setIsOpen,
}: {
  User: userPayload;
  selectYear: number;
  setSelectYear: React.Dispatch<React.SetStateAction<number>>;
  actualYearNumber: number;
  actualMonthNumber: number;
  actualMonthName: string;
  dateSelect: DateProps;
  setDateSelect: React.Dispatch<React.SetStateAction<DateProps>>;
  isOpen: isOpen;
  setIsOpen: React.Dispatch<React.SetStateAction<isOpen>>;
}) => {
  const monthNames = useMemo(
    () => [
      { label: 'Jan', value: 1 },
      { label: 'Fév', value: 2 },
      { label: 'Mar', value: 3 },
      { label: 'Avr', value: 4 },
      { label: 'Mai', value: 5 },
      { label: 'Juin', value: 6 },
      { label: 'Juil', value: 7 },
      { label: 'Août', value: 8 },
      { label: 'Sep', value: 9 },
      { label: 'Oct', value: 10 },
      { label: 'Nov', value: 11 },
      { label: 'Déc', value: 12 },
    ],
    [],
  );

  const minDate = useMemo(() => {
    const minDate = new Date(User.createdAt);
    return { year: minDate.getFullYear(), month: minDate.getMonth() + 1 };
  }, [User.createdAt]);

  const isOutOfRange = useCallback(
    (monthNumber: number) => {
      return (
        (selectYear <= minDate.year && minDate.month > monthNumber) ||
        (selectYear >= actualYearNumber && actualMonthNumber < monthNumber)
      );
    },
    [
      actualMonthNumber,
      actualYearNumber,
      minDate.month,
      minDate.year,
      selectYear,
    ],
  );

  const isOnSelectedRange = useCallback(
    (monthNumber: number) => {
      const { rangeChoose } = dateSelect;
      if (!rangeChoose || !rangeChoose.dateB) return false;

      const { min, max } = oderDates(rangeChoose.dateA, rangeChoose.dateB);
      return !(
        selectYear < min.year ||
        (selectYear === min.year && monthNumber < min.month) ||
        selectYear > max.year ||
        (selectYear === max.year && monthNumber > max.month)
      );
    },
    [dateSelect, selectYear],
  );

  const isSelectedDateRange = useCallback(
    (monthNumber: number) => {
      const { rangeChoose } = dateSelect;
      if (!rangeChoose || !rangeChoose.dateB) return false;

      const { min, max } = oderDates(rangeChoose.dateA, rangeChoose.dateB);
      return (
        (selectYear === min.year && monthNumber === min.month) ||
        (selectYear === max.year && monthNumber === max.month)
      );
    },
    [dateSelect, selectYear],
  );
  const isSelectedYearsRange = useCallback(
    (yearsNumber: number) => {
      const { rangeChoose } = dateSelect;
      if (!rangeChoose || !rangeChoose.dateB) return false;

      const { min, max } = oderDates(rangeChoose.dateA, rangeChoose.dateB);
      return yearsNumber >= min.year && yearsNumber <= max.year;
    },
    [dateSelect],
  );
  const handleChooseMonth = useCallback(
    (i: number) => {
      const actualDate = new Date();
      const actualYears = actualDate.getFullYear();

      const pickMonth = new Date(actualYears, i - 1);
      const monthSelectedName = pickMonth.toLocaleString('fr-FR', {
        month: 'long',
      });

      if (isOpen.range) {
        setDateSelect((v) => {
          if (v.choose) {
            const oldSelect = v.choose;
            return {
              choose: undefined,
              rangeChoose: {
                dateA: {
                  month: i,
                  monthName: monthSelectedName,
                  year: selectYear,
                },
                dateB: oldSelect,
              },
            };
          }
          if (v.rangeChoose?.dateA) {
            const oldSelect = v.rangeChoose.dateA;
            return {
              choose: undefined,
              rangeChoose: {
                dateA: {
                  month: i,
                  monthName: monthSelectedName,
                  year: selectYear,
                },
                dateB: oldSelect,
              },
            };
          }
          return {
            choose: undefined,
            rangeChoose: {
              dateA: {
                month: i,
                monthName: monthSelectedName,
                year: selectYear,
              },
              dateB: undefined,
            },
          };
        });
        return;
      }

      setDateSelect({
        rangeChoose: undefined,
        choose: { month: i, monthName: monthSelectedName, year: selectYear },
      });
      setIsOpen((v) => ({ ...v, open: false }));
    },
    [isOpen.range, selectYear, setDateSelect, setIsOpen],
  );

  const handleChooseYear = useCallback(
    (i: number) => {
      setSelectYear(i);
      setIsOpen((v) => ({ ...v, date: false }));
    },
    [setIsOpen, setSelectYear],
  );

  const handleOpenYear = useCallback(() => {
    setIsOpen((v) => ({ ...v, date: !v.date }));
  }, [setIsOpen]);

  const handleClosePopover = useCallback(() => {
    setIsOpen((v) => ({ ...v, date: false }));
  }, [setIsOpen]);

  const handleCheckboxValueChange = useCallback(
    (open: boolean) => {
      setIsOpen((v) => ({ ...v, range: open }));
    },
    [setIsOpen],
  );

  const plageYears = useMemo(() => {
    const years = [];
    for (let year = minDate.year; year <= actualYearNumber; year++) {
      years.unshift(year);
    }
    return years;
  }, [actualYearNumber, minDate.year]);
  const periodDate = useMemo(() => {
    const { rangeChoose } = dateSelect;
    if (rangeChoose) {
      if (rangeChoose.dateB) {
        const { min, max } = oderDates(rangeChoose.dateA, rangeChoose.dateB);
        return `${serializeMonthName(min.monthName)} ${min.year} - ${serializeMonthName(max.monthName)} ${max.year || ''}`;
      }
      return `${serializeMonthName(rangeChoose.dateA.monthName)} ${rangeChoose.dateA.year} - Seconde Date`;
    }
    if (dateSelect.choose) {
      if (actualYearNumber === dateSelect.choose.year) {
        return serializeMonthName(dateSelect.choose.monthName);
      }
      return `${serializeMonthName(dateSelect.choose.monthName)} ${dateSelect.choose.year}`;
    }
    return serializeMonthName(actualMonthName);
  }, [actualMonthName, actualYearNumber, dateSelect]);
  return (
    <Popover
      onClose={handleClosePopover}
      isOpen={isOpen.open}
      onOpenChange={(open: boolean) => setIsOpen((v) => ({ ...v, open }))}
      classNames={{ content: 'p-0' }}
      placement="top"
      showArrow
    >
      <PopoverTrigger className="p-0">
        <div className="flex flex-col hover:cursor-pointer">
          <span className="text-asset text-i1">Période</span>
          <h4 className="font-semibold my-1 text-p3">{periodDate}</h4>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <div className="max-w-md mx-auto p-2 pb-3 bg-content border-1 border-asset/60 rounded-lg">
          <div className="w-full flex flex-row px-2 pt-0.5 pb-1 border-b-1 border-b-asset/60 text-foreground/90 justify-between">
            <button
              onClick={handleOpenYear}
              className="outline-none flex text-i1 flex-row items-center"
            >
              {selectYear}{' '}
              <RiArrowUpSFill
                className={cn('w-5 h-5 transition-transform', {
                  'rotate-180': isOpen.date,
                })}
              />
            </button>
            <div className="flex flex-row items-center">
              <span className="mr-2 text-i1 font-medium text-foreground/90">
                Étendue
              </span>
              <Checkbox
                classNames={{
                  base: 'w-fit h-fit p-0 m-0 mb-0.5',
                  icon: 'bg-blue-600 w-5 h-5 p-1',
                  wrapper:
                    'bg-asset/10 m-0 w-fit h-fit rounded-md overflow-hidden',
                }}
                isSelected={isOpen.range}
                onValueChange={handleCheckboxValueChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 relative pt-2">
            <div
              className={cn(
                'absolute z-10 opacity-0 top-2 pb-0.5 left-0 w-full h-0 max-h-0 transition-all bg-content',
                {
                  'h-full max-h-full opacity-100': isOpen.date,
                },
              )}
            >
              <ScrollShadow
                hideScrollBar
                orientation="vertical"
                size={10}
                className="relative w-full transition-all h-full bg-asset/10 py-0 text-center auto-rows-max items-start grid grid-cols-3 gap-3 gap-y-3.5"
              >
                {plageYears?.map((y, i) => (
                  <button
                    key={i}
                    onClick={() => handleChooseYear(y)}
                    className={cn(
                      'outline-none border-1 border-transparent !text-p4 p-2 cursor-pointer text-foreground/80 hover:border-foreground/80 rounded',
                      { 'border-foreground/80': selectYear === y },
                      {
                        'border-transparent text-special font-medium':
                          actualYearNumber === y,
                      },
                      {
                        'border-transparent border-b-secondary bg-successBg/30':
                          isSelectedYearsRange(y),
                      },
                    )}
                  >
                    {y}
                  </button>
                ))}
              </ScrollShadow>
            </div>
            {monthNames.map((m) =>
              isOutOfRange(m.value) ? (
                <div
                  key={m.value}
                  className="p-2 outline-none text-center text-i1 opacity-75 cursor-not-allowed text-foreground/70 border-1 border-transparent hover:border-foreground/80 rounded"
                >
                  {m.label}
                </div>
              ) : (
                <button
                  key={m.value}
                  onClick={() => handleChooseMonth(m.value)}
                  className={cn(
                    'p-2 outline-none text-center cursor-pointer text-foreground/80 border-1 border-transparent hover:border-foreground/80 rounded',
                    {
                      'border-foreground/80':
                        dateSelect?.choose?.month === m.value &&
                        dateSelect?.choose?.year === selectYear,
                    },
                    {
                      'text-special font-medium': actualMonthNumber === m.value,
                    },
                    {
                      'border-b-secondary bg-successBg/30': isOnSelectedRange(
                        m.value,
                      ),
                    },
                    {
                      'border-successTxt/60 bg-primary/60 text-white':
                        isOnSelectedRange(m.value) &&
                        isSelectedDateRange(m.value),
                    },
                  )}
                >
                  {m.label}
                </button>
              ),
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Calendar;

function serializeMonthName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function oderDates(
  dateA: dateSelect,
  dateB: dateSelect,
): { min: dateSelect; max: dateSelect } {
  const min =
    dateA.year < dateB.year ||
    (dateA.year === dateB.year && dateA.month < dateB.month)
      ? dateA
      : dateB;
  const max = min === dateA ? dateB : dateA;
  return { min, max };
}
