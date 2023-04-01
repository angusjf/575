import { syllable } from "syllable";

export const customSyllables = (str: string) =>
  syllable(str) +
  str
    .split("")
    .map(mapZeroSyllableSymbolToTrueSyllableCount)
    .reduce((acc, x) => acc + x, 0);

const mapZeroSyllableSymbolToTrueSyllableCount = (char: string): number => {
  if (char.match(/[0-9]/)) {
    return 1;
  }
  if (char == "&") {
    // pronounced "and"
    return syllable("and");
  }
  if (char == "%") {
    return syllable("percent");
  }
  if (char == "£") {
    return syllable("pounds");
  }
  return 0;
};
