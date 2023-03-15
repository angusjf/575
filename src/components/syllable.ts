import { syllable } from "syllable";

export const syllableWithDigits = (str: string) =>
  syllable(str) + str.split("").filter(numeric).length;

const numeric = (char: string) => char.match(/[0-9]/) != null;
