export function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
