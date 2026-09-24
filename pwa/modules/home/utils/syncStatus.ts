import { daysAgo, formatDateTime, formatTime } from "@/pwa/shared/utils/format";

export function formatNextSync(value: string): string {
  const date = new Date(value);
  if (date.getTime() <= Date.now()) return "em breve";

  const days = daysAgo(date);
  if (days === 0) return `hoje às ${formatTime(date)}`;
  if (days === -1) return `amanhã às ${formatTime(date)}`;
  return formatDateTime(date);
}
