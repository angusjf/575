import { getDatabase, ref, set, get, child } from "firebase/database";
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
          | Record<string, { haiku: Haiku; username: string }>
          | undefined) ?? []
      )
        .map(([userId, data]) => ({
          author: { userId, name: data.username },
          haiku: data.haiku,
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
