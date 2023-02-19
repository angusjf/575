import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get, remove, child } from "firebase/database";
import { firebaseApp } from "./firebase";
import { Haiku, Day } from "./types";
import { dateDbKey, parseDateDbKey } from "./utils/date";

export const writeUserData = (userId: string, name: string) => {
  const db = getDatabase(firebaseApp);
  set(ref(db, "users/" + userId), {
    name,
  });
};

export const post = async (userId: string, haiku: Haiku) => {
  const db = getDatabase(firebaseApp);
  await set(ref(db, `days/${dateDbKey(new Date())}/${userId}`), {
    haiku,
  });
};

export const registerUser = async (userId: string) => {
  const db = getDatabase(firebaseApp);
  set(ref(db, "users/" + userId), {
    userId,
  });
};

export const getDays = async (username: string): Promise<Day[]> => {
  const db = getDatabase(firebaseApp);
  const days = await get(ref(db, "days/"));

  const blockingUsers = await getBlockingUsers(username);
  const blockedUsers = await getBlockedUsers(username);

  return Object.entries(days.val()).map(([date, posts]) => ({
    date: parseDateDbKey(date),
    posts: Object.entries(
      (posts as Record<string, { haiku: Haiku }> | undefined) ?? []
    )
      .map(([user, data]) => ({
        author: user,
        haiku: data.haiku,
      }))
      .filter(
        (post) =>
          !blockingUsers.map((user) => user[0]).includes(post.author) &&
          !blockedUsers.map((user) => user[0]).includes(post.author)
      ),
  }));
};

export const deleteAccount = async () => {
  const auth = getAuth(firebaseApp);

  await auth.currentUser?.delete();
};

export const uploadExpoPushToken = ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) => {
  const db = getDatabase(firebaseApp);
  set(ref(db, `expoPushTokens/${userId}/`), token);
};

export const blockUser = async (userId: string, blockedUserId: string) => {
  const db = getDatabase(firebaseApp);
  await Promise.all([
    set(ref(db, `blockedUsers/${userId}/${blockedUserId}`), true),
    set(ref(db, `blockedUsers/${blockedUserId}/${userId}`), true),
  ]);
};

export const getBlockingUsers = async (userId: string) => {
  try {
    const db = getDatabase(firebaseApp);
    const blockedUsers = await get(ref(db, `blockedUsers/${userId}`));

    return Object.entries(blockedUsers.val());
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getBlockedUsers = async (userId: string) => {
  try {
    const db = getDatabase(firebaseApp);
    const blockedUsers = await get(ref(db, `blockedUsers/${userId}`));

    return Object.entries(blockedUsers.val());
  } catch (e) {
    console.log(e);
    return [];
  }
};
