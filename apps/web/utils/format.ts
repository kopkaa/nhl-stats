export function formatHeight(cm: number | null | undefined): string {
  if (!cm) return '—';
  const totalInches = Math.round(cm / 2.54);
  return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
}

export function formatToi(minutes: number | null | undefined): string {
  if (!minutes) return '—';
  const min = Math.floor(minutes);
  const sec = Math.round((minutes - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function formatPctg(pctg: number | null | undefined): string {
  if (pctg == null) return '—';
  return (pctg * 100).toFixed(1);
}

export function ordinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
