export type Haiku = [string, string, string];

export type Day = { date: Date; posts: Post[] };

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
};

export type BlockedUser = {
  username: string;
  userId: string;
};
