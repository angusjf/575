export const dateDbKey = (date: Date) =>
  `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
