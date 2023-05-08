export type Haiku = [string, string, string];

export type Day = { date: Date; posts: Post[] };

export type PastHaiku = {
  haiku: Haiku;
  date: string;
  username: string;
};

export type Post = {
  haiku: Haiku;
  author: User;
  signature: string;
  timestamp: number;
};

export type User = {
  username: string;
  userId: string;
  email: string;
  avatar: string;
  signature: string;
  streak: number;
  pastHaikus: PastHaiku[];
};

export type BlockedUser = {
  username: string;
  userId: string;
};
