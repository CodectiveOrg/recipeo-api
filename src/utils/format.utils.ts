const AMOUNT_SYMBOLS: { value: number; symbol: string | null }[] = [
  { value: 0, symbol: null },
  { value: 1 / 8, symbol: "⅛" },
  { value: 1 / 6, symbol: "⅙" },
  { value: 1 / 5, symbol: "⅕" },
  { value: 1 / 3, symbol: "⅓" },
  { value: 1 / 4, symbol: "¼" },
  { value: 3 / 8, symbol: "⅜" },
  { value: 1 / 2, symbol: "½" },
  { value: 5 / 8, symbol: "⅝" },
  { value: 2 / 3, symbol: "⅔" },
  { value: 3 / 4, symbol: "¾" },
  { value: 5 / 6, symbol: "⅚" },
  { value: 7 / 8, symbol: "⅞" },
];

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

export function formatAmount(amount: number): string {
  const decimal = Math.floor(amount);
  const float = amount - decimal;

  const symbol = ((): string | null => {
    let minDiff = Number.POSITIVE_INFINITY;
    let selectedItem = AMOUNT_SYMBOLS[0];

    for (const item of AMOUNT_SYMBOLS) {
      const diff = Math.abs(float - item.value);
      if (diff < minDiff) {
        minDiff = diff;
        selectedItem = item;
      }
    }

    return selectedItem.symbol;
  })();

  const formattedDecimal = decimal > 0 ? decimal.toString() : "";
  const formattedFloat = symbol ?? "";

  return formattedDecimal + formattedFloat;
}
