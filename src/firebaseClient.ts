import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get, remove, child } from "firebase/database";
import { firebaseApp } from "./firebase";
import { Haiku, Day, User } from "./types";
import { dateDbKey, parseDateDbKey } from "./utils/date";

export const post = async (user: User, haiku: Haiku) => {
  const db = getDatabase(firebaseApp);
  await set(ref(db, `days/${dateDbKey(new Date())}/${user.userId}`), {
    haiku,
    timestamp: Date.now(),
    username: user.username,
  });
};

/**
 * Register the user in the DB for storing additional info.
 *
 * THIS IS NOT THE SAME AS AUTHENTICATION.
 *
 * @param user - User being registered
 */
export const registerUser = async (user: User) => {
  const db = getDatabase(firebaseApp);
  set(ref(db, "users/" + user.userId), {
    username: user.username,
    registeredAt: Date.now(),
  });
};

export const getDays = async (user: User): Promise<Day[]> => {
  try {
    const db = getDatabase(firebaseApp);
    const days = await get(ref(db, "days/"));

    const blockedUsers = await getBlockedUsers(user);

    return Object.entries(days.val()).map(([date, posts]) => ({
      date: parseDateDbKey(date),
      posts: Object.entries(
        (posts as
          | Record<
              string,
              { haiku: Haiku; username: string; timestamp: number }
            >
          | undefined) ?? []
      )
        .map(([userId, data]) => ({
          author: { userId, name: data.username },
          haiku: data.haiku,
          timestamp: data.timestamp,
        }))
        .filter(
          (post) =>
            !blockedUsers.map((user) => user[0]).includes(post.author.userId)
        ),
    }));
  } catch (e) {
    console.log(e);
    return [];
  }
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

export const blockUser = async (user: User, blockedUserId: string) => {
  const db = getDatabase(firebaseApp);
  await Promise.all([
    set(ref(db, `blockedUsers/${user.userId}/${blockedUserId}`), true),
    set(ref(db, `blockedUsers/${blockedUserId}/${user.userId}`), true),
  ]);
};

export const getBlockedUsers = async (user: User) => {
  try {
    const db = getDatabase(firebaseApp);
    const blockedUsers = await get(ref(db, `blockedUsers/${user.userId}`));

    return Object.entries(blockedUsers.val());
  } catch (e) {
    console.log(e);
    return [];
  }
};
