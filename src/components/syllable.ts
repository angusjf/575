import { syllable } from "syllable";

export const customSyllables = (str: string) =>
  syllable(str) +
  str
    .split("")
    .map((char) => syllable(pronounced[char] ?? ""))
    .reduce((acc, x) => acc + x, 0);

const pronounced: Partial<Record<string, string>> = {
  "0": "zero",
  "1": "one",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "&": "and",
  "%": "percent",
  "£": "pounds",
  $: "dollars",
  "@": "at",
  "+": "plus",
};
