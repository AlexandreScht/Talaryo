'use client';

import Graph from '@/components/graphique';
import Calendar from '@/components/graphique/calendar';
import GraphLoading from '@/components/graphique/loading';
import GenerateGraphHooks from '@/hooks/graphique/useGraph';
import useAppContext from '@/hooks/providers/AppProvider';
import { dateSelect, onlyDateSelect } from '@/interfaces/graph';
import { graphicData, graphScore } from '@/interfaces/scores';
import { userPayload } from '@/interfaces/users';
import cn from '@/utils/cn';

import React, { useEffect, useMemo } from 'react';

const GraphStats = ({ className, User }: { className?: string; User: userPayload }) => {
  const {
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
  } = GenerateGraphHooks();

  const {
    services: { getUserScore },
  } = useAppContext();

  useEffect(() => {
    const fetchScore = async () => {
      const currentMonth = new Date(actualYearNumber, actualMonthNumber - 1, 1);
      const { err, res } = await getUserScore({
        startDate: currentMonth.toISOString(),
        endDate: today.toISOString(),
      });
      setState({ loading: false, err: !!err || !res });
      setGraphState(res as graphScore);
    };
    fetchScore();
  }, [actualMonthNumber, actualYearNumber, getUserScore, setGraphState, setState, today]);

  useEffect(() => {
    const { rangeChoose, choose } = dateSelect;
    if (!choose && !rangeChoose?.dateB) {
      return;
    }

    const { min, max }: { min: onlyDateSelect; max: onlyDateSelect } = rangeChoose?.dateB
      ? oderDates(rangeChoose.dateA, rangeChoose.dateB)
      : {
          min: {
            year: (choose as dateSelect).year,
            month: (choose as dateSelect).month,
          },
          max: {
            year: (choose as dateSelect).year,
            month: (choose as dateSelect).month,
          },
        };

    const firstDay = new Date(min.year, min.month - 1, 1);
    const lastDay = new Date(max.year, max.month, 0);

    const handleFetchScore = async () => {
      setState(v => ({ ...v, loading: true }));
      const { err: graphErr, res } = await getUserScore({
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString(),
      });

      setState(v => ({ ...v, loading: false }));
      if (graphErr) {
        setState(v => ({ ...v, err: true }));
        return;
      }
      setGraphState(res as any);
    };
    handleFetchScore();
  }, [dateSelect, getUserScore, setGraphState, setState]);

  const GraphicData: graphicData | undefined = useMemo(() => {
    if (state.err) {
      return undefined;
    }

    const {
      fetchedScore: {
        scores,
        meta: { totalProfiles: newProfiles, totalSearches: newSearches },
      },
    } = graphState;

    const cT = new Date();
    const timeNow = {
      year: cT.getFullYear(),
      month: cT.getMonth() + 1,
      day: cT.getDate(),
    };

    const { rangeChoose, choose } = dateSelect;

    const { min, max }: { min: onlyDateSelect; max: onlyDateSelect } = rangeChoose?.dateB
      ? oderDates(rangeChoose.dateA, rangeChoose.dateB)
      : {
          min: {
            year: (choose as dateSelect)?.year ?? timeNow.year,
            month: (choose as dateSelect)?.month ?? timeNow.month,
          },
          max: {
            year: (choose as dateSelect)?.year ?? timeNow.year,
            month: (choose as dateSelect)?.month ?? timeNow.month,
          },
        };

    const totalSearches = Number.parseInt(newSearches) ?? 0;
    const totalProfiles = Number.parseInt(newProfiles) ?? 0;

    if (!graphState.lastScores) {
      return {
        totalSearches,
        totalProfiles,
        profileScore: null,
        searchScore: null,
        dataGraph: { scores, min, max },
      };
    }

    const {
      lastScores: { totalProfiles: oldProfiles, totalSearches: oldSearches },
    } = graphState;

    const profileScore = calculatePercentage(Number.parseInt(oldProfiles), totalProfiles, getDaysInLastMonth(), timeNow.day);
    const searchScore = calculatePercentage(Number.parseInt(oldSearches), totalSearches, getDaysInLastMonth(), timeNow.day);

    return {
      totalSearches,
      totalProfiles,
      profileScore,
      searchScore,
      dataGraph: { scores, min, max },
    };
  }, [dateSelect, graphState, state.err]);

  return state.err || !GraphicData ? (
    <div className="flex flex-col justify-center h-full text-center">
      <span className="text-foreground/90 text-p1 font-medium">Une erreur inattendue est survenue</span>
      <span className="text-foreground/90 text-p1 lg:mt-7 xl:mt-10 font-medium">Veuillez réessayer ultérieurement</span>
    </div>
  ) : (
    <>
      <div className={className}>
        <div className="flex flex-col pt-0.5">
          <span className="text-asset text-i1">{GraphicData.totalProfiles > 1 ? 'Profils consultés' : 'Profil consulté'}</span>
          <div className="flex flex-row items-center">
            <h4 className="text-p3 py-1 font-semibold">{GraphicData.totalProfiles.toLocaleString()}</h4>
            {!!GraphicData?.profileScore && !isNaN(GraphicData.profileScore) && (
              <span
                className={cn('ml-2 flex justify-center items-center h-fit p-1 rounded-md !text-i3 text-validTxt bg-validBg', {
                  'text-errorTxt bg-errorBg': GraphicData.profileScore < 0,
                })}
              >
                {`${GraphicData?.profileScore > 0 ? '+' : ''}${GraphicData.profileScore}%`}
              </span>
            )}
          </div>
        </div>
        <Calendar
          User={User}
          selectYear={selectYear}
          setSelectYear={setSelectYear}
          actualYearNumber={actualYearNumber}
          actualMonthNumber={actualMonthNumber}
          actualMonthName={actualMonthName}
          dateSelect={dateSelect}
          setDateSelect={setDateSelect}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
        <div className="flex flex-col">
          <span className="text-asset text-i1">Nombre de recherches</span>
          <div className="flex items-center flex-row">
            <h4 className="font-semibold py-1 text-p3">{GraphicData.totalSearches.toLocaleString()}</h4>
            {GraphicData.searchScore && !isNaN(GraphicData.searchScore) && (
              <span
                className={cn('ml-2 flex justify-center items-center h-fit p-1 rounded-md !text-i3 text-validTxt bg-validBg', {
                  'text-errorTxt bg-errorBg': GraphicData.searchScore < 0,
                })}
              >
                {`${GraphicData.searchScore > 0 ? '+' : ''}${GraphicData.searchScore}%`}
              </span>
            )}
          </div>
        </div>
      </div>
      {state.loading ? <GraphLoading /> : <Graph className="h-5/6" dataGraph={GraphicData.dataGraph} />}
    </>
  );
};

export default GraphStats;

function calculatePercentage(
  previousMonthScore: number,
  currentMonthScore: number,
  daysInPreviousMonth: number,
  currentDayOfMonth: number,
): number | null {
  if (!previousMonthScore) {
    return null;
  }
  const dailyAveragePreviousMonth = previousMonthScore / daysInPreviousMonth;
  const expectedCurrentScore = dailyAveragePreviousMonth * currentDayOfMonth;
  const percentageChange = ((currentMonthScore - expectedCurrentScore) / expectedCurrentScore) * 100;

  return Number.parseFloat(percentageChange.toFixed(2));
}

function getDaysInLastMonth(): number {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month, 0).getDate();
}

function oderDates(dateA: dateSelect, dateB: dateSelect): { min: dateSelect; max: dateSelect } {
  const min = dateA.year < dateB.year || (dateA.year === dateB.year && dateA.month < dateB.month) ? dateA : dateB;
  const max = min === dateA ? dateB : dateA;
  return { min, max };
}
