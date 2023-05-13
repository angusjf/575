import { syllable } from "syllable";

export const customSyllables = (str: string) =>
  syllable(pronounced.reduce((s, [from, to]) => s.replace(from, to), str));

const pronounced: [string | RegExp, string][] = [
  ["100", "one hundred"],
  ["10", "ten"],
  ["11", "eleven"],
  ["12", "twelve"],
  ["99", "ninety nine"],
  ["0", "zero"],
  ["1", "one"],
  ["2", "two"],
  ["3", "three"],
  ["4", "four"],
  ["5", "five"],
  ["6", "six"],
  ["7", "seven"],
  ["8", "eight"],
  ["9", "nine"],
  ["&", "and"],
  ["%", "percent"],
  ["£", "pounds"],
  ["$", "dollars"],
  ["@", "at"],
  ["+", "plus"],
  [/ruined/i, "ru ined"],
  [/BST/, "B S T"],
  [/poems/i, "po ems"],
  [/reunited/i, "re united"],
  [/else/i, "els"],
];
