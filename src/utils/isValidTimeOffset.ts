export const isValidTimeOffset = (
  value: number | undefined
): value is number => {
  if (typeof value !== "number") return false;
  if (isNaN(value)) return false;
  if (value < -60 || value > 60) return false;

  return true;
};
