export const timeToSeconds = (timeString: string): number => {
  const [time, ms] = timeString.split(",");
  const [hours, minutes, seconds] = time.split(":").map(Number);

  return hours * 3600 + minutes * 60 + seconds + parseInt(ms, 10) / 1000;
};
