'use client';

import { DateProps, isOpen } from '@/interfaces/graph';
import { graphScore } from '@/interfaces/scores';
import { useMemo, useState } from 'react';

const GenerateGraphHooks = () => {
  const { today, actualMonthName, actualMonthNumber, actualYearNumber } = useMemo(() => {
    const today = new Date();
    return {
      today,
      actualMonthNumber: today.getMonth() + 1,
      actualYearNumber: today.getFullYear(),
      actualMonthName: today.toLocaleString('fr-FR', { month: 'long' }),
    };
  }, []);
  const [graphState, setGraphState] = useState<graphScore>({
    lastScores: { totalProfiles: '0', totalSearches: '0' },
    fetchedScore: {
      scores: [],
      meta: { totalProfiles: '0', totalSearches: '0' },
    },
  });
  const [selectYear, setSelectYear] = useState<number>(actualYearNumber);
  const [state, setState] = useState<{ err: boolean; loading: boolean }>({
    err: false,
    loading: true,
  });
  const [dateSelect, setDateSelect] = useState<DateProps>({
    choose: undefined,
    rangeChoose: undefined,
  });
  const [isOpen, setIsOpen] = useState<isOpen>({
    open: false,
    range: false,
    date: false,
  });

  return {
    today,
    actualMonthName,
    actualMonthNumber,
    actualYearNumber,
    graphState,
    setGraphState,
    selectYear,
    setSelectYear,
    state,
    setState,
    dateSelect,
    setDateSelect,
    isOpen,
    setIsOpen,
  };
};

export default GenerateGraphHooks;
