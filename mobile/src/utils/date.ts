export const dateDbKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export const parseDateDbKey = (date: string) => {
  return new Date(date.replace(/-/g, "/"));
};

export const timestampToRelative = (timestamp: number) => {
  const timeNow = new Date();
  const date = new Date(timestamp);
  const timeDiff = timeNow.getTime() - date.getTime();
  const timeDiffInHours = timeDiff / 1000 / 60 / 60;
  const timeDiffInDays = timeDiffInHours / 24;
  const timeDiffInMins = timeDiff / 1000 / 60;

  if (timeDiffInHours < 1) {
    return `${Math.round(timeDiffInMins)} mins ago`;
  } else if (timeDiffInDays < 1) {
    return `${Math.round(timeDiffInHours)} hours ago`;
  } else if (timeDiffInDays == 1) {
    return `1 day ago`;
  } else {
    return `${Math.round(timeDiffInDays)} days ago`;
  }
};

export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
