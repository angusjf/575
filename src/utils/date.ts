export const dateDbKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const parseDateDbKey = (date: string) => {
  return new Date(date.replace(/-/g, "/"));
};
