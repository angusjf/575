export type Haiku = [string, string, string];

export type Day = { date: Date; posts: Post[] };

export type Comment = { author: string; comment: string };

export type Post = {
  haiku: Haiku;
  author: User;
  signature: string;
  timestamp: number;
  comments: Comment[];
};

export type User = {
  username: string;
  userId: string;
  email: string;
  avatar: string;
  signature: string;
  streak: number;
};

export type BlockedUser = {
  username: string;
  userId: string;
};
