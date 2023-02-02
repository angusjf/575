export function getSeason(
  date: Date
): "Spring" | "Summer" | "Autumn" | "Winter" {
  const month = date.getMonth();

  if (2 <= month && month <= 4) {
    return "Spring";
  }

  if (5 <= month && month <= 7) {
    return "Summer";
  }

  if (8 <= month && month <= 10) {
    return "Autumn";
  }

  return "Winter";
}
