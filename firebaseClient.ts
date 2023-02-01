import { getDatabase, ref, set, get, child } from "firebase/database";
import { firebaseApp } from "./firebase";
import { Haiku, Day, Post } from "./src/types";
import { dateDbKey } from "./utils/date";

export const writeUserData = (userId: string, name: string) => {
  const db = getDatabase(firebaseApp);
  set(ref(db, "users/" + userId), {
    name,
  });
};

export const isUserUnique = async (userId: string) => {
  const db = getDatabase(firebaseApp);
  const dbRef = ref(db, `users/${userId}`);
  return await get(dbRef).then((snapshot) => {
    return !snapshot.exists();
  });
};

export const post = (userId: string, haiku: Haiku) => {
  const db = getDatabase(firebaseApp);
  set(ref(db, `days/${dateDbKey(new Date())}/${userId}`), {
    haiku,
  });
};

export const registerUser = async (userId: string) => {
  const userUniqueness = await isUserUnique(userId);

  if (!userUniqueness) throw Error("Not unique");

  const db = getDatabase(firebaseApp);
  set(ref(db, "users/" + userId), {
    userId,
  });
};

export const getDays = async (): Promise<Day[]> => {
  const db = getDatabase(firebaseApp);
  const days = await get(ref(db, "days/"));

  return Object.entries(days.val()).map(([date, posts]) => ({
    date: new Date(date),
    posts: Object.entries(posts as Record<string, { haiku: Haiku }>).map(
      ([user, data]) => ({
        author: user,
        haiku: data.haiku,
      })
    ),
  }));
};

export const hasPostedToday = async (userId: string) => {
  const db = getDatabase(firebaseApp);
  const dbRef = ref(db, `days/${dateDbKey(new Date())}/${userId}`);
  return await get(dbRef).then((snapshot) => {
    return snapshot.exists();
  });
};
