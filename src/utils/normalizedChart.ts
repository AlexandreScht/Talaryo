export default function normalizedChart(str: string | null): string {
  if (!str) {
    return '';
  }
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
