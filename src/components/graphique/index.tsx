'use client';
import { graphXLabel, labelType } from '@/interfaces/graph';
import { dataGraph, scores } from '@/interfaces/scores';
import cn from '@/utils/cn';
import type { ChartOptions, ScriptableContext } from 'chart.js';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js/auto';
import { ChartData } from 'chartJs';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { Chart } from 'react-chartjs-2';
ChartJS.register(
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
);

const Graph = ({
  className,
  dataGraph,
}: {
  className?: string;
  dataGraph: dataGraph;
}) => {
  const chartAxes = useMemo(() => {
    const today = new Date();
    const { max, min, scores } = dataGraph;
    const isCurrentMonth =
      max.year === today.getFullYear() && max.month === today.getMonth() + 1;
    const endDate = isCurrentMonth
      ? today.getDate() <= 5
        ? new Date(max.year, max.month - 1, 5)
        : today
      : new Date(max.year, max.month, 0);
    const yearsDiff = max.year - min.year;
    const monthDiff = yearsDiff * 12 + max.month + 1 - min.month;

    const labelsIdx = generateNumberLabelsX(yearsDiff, monthDiff);
    const axeX: graphXLabel[] = [];

    const stepDate = new Date(min.year, min.month - 1, 1);

    const formatDateLabel = (date: Date, labelType: labelType) => {
      switch (labelType) {
        case 'day': {
          if (max.month === min.month) {
            const label = date.toLocaleDateString('fr-FR', {
              day: '2-digit',
            });
            return label;
          }
          const label = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
          });
          return label.replace('.', '');
        }
        case 'month': {
          if (max.year === min.year) {
            return '01/' + (date.getMonth() + 1).toString().padStart(2, '0');
          }
          return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          });
        }
        case 'year':
          return date.getFullYear().toString();
        default:
          return '';
      }
    };

    const addLabel = (date: Date, labelType: labelType, end?: boolean) => {
      const isEnd = date > endDate;
      const useDate = isEnd || end ? endDate : date;
      const label = {
        yyyy: useDate.getFullYear(),
        mm: labelType !== 'year' ? useDate.getMonth() + 1 : 1,
        dd: labelType === 'day' ? useDate.getDate() : 1,
        label: formatDateLabel(useDate, labelType),
      };
      axeX.push(label);
    };

    while (stepDate <= endDate) {
      if (labelsIdx.day) {
        addLabel(stepDate, 'day');
        stepDate.setDate(stepDate.getDate() + Math.round(labelsIdx.day));
        if (
          stepDate.getMonth() === endDate.getMonth() &&
          stepDate.getDate() > endDate.getDate() - labelsIdx.day
        ) {
          addLabel(stepDate, 'day', true);
          break;
        }
      } else if (labelsIdx.month) {
        addLabel(stepDate, 'month');
        stepDate.setMonth(stepDate.getMonth() + Math.round(labelsIdx.month));
      } else if (labelsIdx.year) {
        addLabel(stepDate, 'year');
        stepDate.setFullYear(
          stepDate.getFullYear() + Math.round(labelsIdx.year),
        );
      }
    }

    const getDate = (entry: graphXLabel) =>
      new Date(entry.yyyy, entry.mm - 1, entry.dd);

    const prepareChartData = (axeX: graphXLabel[], scores: scores[]) => {
      const ranges = axeX.map((entry, index) => ({
        startDate: getDate(entry),
        endDate:
          index + 1 < axeX.length
            ? getDate(axeX[index + 1])
            : new Date(entry.yyyy + 1, 0, 1),
        totalProfils: 0,
      }));

      scores.forEach(({ year, month, day, profils }) => {
        const date = new Date(year, month - 1, day);
        const range = ranges.find(
          (r) => date >= r.startDate && date < r.endDate,
        );
        if (range) {
          range.totalProfils += profils;
        }
      });

      return ranges.map((range) => range.totalProfils);
    };
    const Yaxe = prepareChartData(axeX, scores);
    return {
      Yaxe,
      Xaxe: axeX.map((v) => v.label),
      Ymax: Math.max(...Yaxe) > 100 ? Math.max(...Yaxe) : 100,
    };
  }, [dataGraph]);

  const [themeColors, setThemeColors] = useState<Record<string, string>>({});
  const { theme } = useTheme();

  const MyCustomTheme: Record<string, Record<string, string>> = useMemo(() => {
    return {
      light: {
        line: '#2970ff',
        top: 'rgba(0, 55, 194, 1)',
        bottom: 'rgba(0, 55, 194, 0.1)',
        Xline: '#c9dbff',
        Yline: '#868686',
        firstLine: '#6F6F6F',
        labels: '#868686',
      },
      dark: {
        line: '#1f96d6',
        top: 'rgba(41, 112, 255, 1)',
        bottom: 'rgba(41, 112, 255, 0.1)',
        Xline: '#042260',
        Yline: '#2b3341',
        firstLine: '#909090',
        labels: '#7b91af',
      },
    };
  }, []);

  useEffect(() => {
    if (!theme) {
      return;
    }
    setThemeColors(MyCustomTheme[theme]);
  }, [MyCustomTheme, theme]);

  const chartData: ChartData = {
    labels: chartAxes.Xaxe,
    datasets: [
      {
        data: chartAxes.Yaxe,
        borderColor: themeColors.line,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 2,
        tension: 0.4,
        fill: {
          target: 'origin',
          above: (context: ScriptableContext<'line'>) => {
            if (!context.chart.chartArea || !theme) {
              return '';
            }
            const {
              ctx,
              chartArea: { top, bottom },
            } = context.chart;
            const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);

            gradientBg.addColorStop(0, MyCustomTheme[theme].top);
            gradientBg.addColorStop(0.9, MyCustomTheme[theme].bottom);
            return gradientBg;
          },
        },
      },
    ],
  };

  const options: ChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: () => '',
          title: (context) => {
            if (context.length > 0) {
              const firstItem = context[0];
              return firstItem.parsed.y.toString() || '';
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: themeColors.labels },
        border: { color: themeColors.firstLine, width: 2 },
        grid: {
          display: true,
          color: themeColors.Xline,
          drawTicks: true,
        },
      },
      y: {
        max: chartAxes.Ymax,
        beginAtZero: true,
        border: { dash: [2, 3], color: themeColors.firstLine, width: 2 },
        ticks: {
          stepSize: getStepSize(chartAxes.Ymax),
        },
        grid: {
          display: true,
          color: themeColors.Yline,
          drawTicks: false,
        },
      },
    },
  };

  return (
    <div className={cn('h-full w-full', className)}>
      <Chart type="line" options={options} data={chartData} />
    </div>
  );
};

export default Graph;

function getStepSize(maxY: number) {
  if (maxY <= 250) {
    return 25;
  }
  return 50 * Math.ceil(maxY / 500);
}

function generateNumberLabelsX(yearsDiff: number, monthDiff: number) {
  if (!yearsDiff || (yearsDiff === 1 && monthDiff <= 12)) {
    return monthDiff === 1
      ? { day: 1, month: null, year: null }
      : monthDiff >= 5
        ? { day: null, month: 1, year: null }
        : { day: 5 * (monthDiff - 1), month: null, year: null };
  }
  return yearsDiff <= 5
    ? { day: null, month: Math.round(monthDiff / 10), year: null }
    : yearsDiff <= 15
      ? { day: null, month: null, year: 1 }
      : { day: null, month: null, year: Math.round(yearsDiff / 10) };
}
