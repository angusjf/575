export type Haiku = [string, string, string];

export type Day = { date: Date; posts: Post[] };

export type Post = { haiku: Haiku; author: string };
