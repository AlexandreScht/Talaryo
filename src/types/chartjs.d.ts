declare module 'chartJs' {
  import type { ChartData as Chart, Color, ScriptableContext } from 'chart.js';

  type GradientAbove = { above: (value: ScriptableContext<'line'>) => Color };
  type ChartData = Chart<ChartType, number[], string, GradientAbove>;
}
