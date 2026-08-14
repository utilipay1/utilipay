export function toInFilter(value: string | null): { $in: string[] } | undefined {
  if (!value) return undefined;
  const items = value.split(',').map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) return undefined;
  return { $in: items };
}
