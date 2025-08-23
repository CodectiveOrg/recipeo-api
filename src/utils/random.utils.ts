export function generateRandomInteger({
  min = 0,
  max = 99,
}: {
  min: number;
  max: number;
}): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function generateRandomDate(): Date {
  const millisecondsMultiplier = 3600 * 1000;

  const offset = generateRandomInteger({
    min: 24 * millisecondsMultiplier,
    max: 2400 * millisecondsMultiplier,
  });

  return new Date(+new Date() - offset);
}
