export function assignDefinedValues<T extends object>(
  original: T,
  changes: Partial<T>,
): T {
  const clone = { ...original };

  (Object.keys(changes) as (keyof T)[]).forEach((key) => {
    if (changes[key] !== undefined) {
      clone[key] = changes[key];
    }
  });

  return clone;
}
