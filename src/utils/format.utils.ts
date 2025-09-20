export function formatFilenamePrefix(date: Date): string {
  const parts = [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ];

  return parts.map((x) => x.toString().padStart(2, "0")).join("");
}

export function capitalize(text: string): string {
  const parts = text.split(" ");

  const capitalizedParts = parts.map(
    (part) => `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`,
  );

  return capitalizedParts.join(" ");
}
