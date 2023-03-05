export type Haiku = [string, string, string];

export type Day = { date: Date; posts: Post[] };

export type Post = {
  haiku: Haiku;
  author: { userId: string; name: string };
  timestamp: number;
};

export type User = {
  username: string;
  userId: string;
  email: string;
  avatar: string;
  signature: string;
};
