import { endOfYesterday } from "date-fns";
import {
  EmailAuthProvider,
  getAuth,
  reauthenticateWithCredential,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  increment,
  push,
} from "firebase/database";
import { firebaseApp } from "./firebase";
import { Haiku, Day, User, Post, BlockedUser } from "./types";
import { dateDbKey, parseDateDbKey } from "./utils/date";
import { firebaseUserToUser } from "./utils/user";

export const post = async (user: User, haiku: Haiku) => {
  const db = getDatabase(firebaseApp);

  const post: Post = {
    haiku,
    timestamp: Date.now(),
    author: user,
    signature: user.signature,
  };

  await set(ref(db, `days/${dateDbKey(new Date())}/${user.userId}`), post);
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
    signature: user.signature,
    streak: 0,
  });
};

export const updateSignature = async (user: User, signature: string) => {
  const db = getDatabase(firebaseApp);
  set(ref(db, `users/${user.userId}/signature`), signature);
};

export const reportUser = async ({
  reporterId,
  badGuyId,
}: {
  reporterId: string;
  badGuyId: string;
}) => {
  const db = getDatabase(firebaseApp);
  push(ref(db, `reports`), {
    reporterId,
    badGuyId,
  });
};

export const getUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const db = getDatabase(firebaseApp);
  const user = (await get(ref(db, `users/${firebaseUser.uid}`))).toJSON() as {
    signature: string;
    streak: number;
  };

  return firebaseUserToUser(firebaseUser, user.signature, user.streak);
};

export const getDays = async (user: User): Promise<Day[]> => {
  try {
    const db = getDatabase(firebaseApp);
    const days = await get(ref(db, "days/"));

    const [blockedUsers, blockingUsers] = await Promise.all([
      getBlockedUsers(user),
      getBlockingUsers(user),
    ]);

    const json = days.toJSON();
    if (!json) throw new Error("bad json");

    return Object.entries(json)
      .map(([date, posts]) => ({
        date: parseDateDbKey(date),
        posts: Object.entries((posts as Record<string, Post> | undefined) ?? [])
          .map(([userId, data]) => ({
            author: data.author,
            haiku: Object.values(data.haiku) as Haiku,
            timestamp: data.timestamp,
            signature: data.signature,
          }))
          .filter(
            (post) =>
              !blockedUsers
                .map((user) => user[0])
                .includes(post.author.userId) &&
              !blockingUsers
                .map((user) => user.userId)
                .includes(post.author.userId)
          ),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const deleteAccount = async (password: string) => {
  const auth = getAuth(firebaseApp);
  if (!auth.currentUser) return;
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email ?? "",
    password
  );
  reauthenticateWithCredential(auth.currentUser, credential);
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

export const incStreak = async (userId: string) => {
  const db = getDatabase(firebaseApp);
  const yesterday = endOfYesterday();
  const yesterdayPost = await get(
    ref(db, `days/${dateDbKey(yesterday)}/${userId}`)
  );
  await set(
    ref(db, `users/${userId}/streak`),
    yesterdayPost === null ? 0 : increment(1)
  );
};

export const blockUser = async (
  user: User,
  blockedUserId: string,
  blockedUserName: string
) => {
  const db = getDatabase(firebaseApp);
  await Promise.all([
    set(ref(db, `blocks/${user.userId}/${blockedUserId}`), blockedUserName),
    set(ref(db, `blocked/${blockedUserId}/${user.userId}`), true),
  ]);
};

export const getBlockingUsers = async (user: User): Promise<BlockedUser[]> => {
  try {
    const db = getDatabase(firebaseApp);
    const blockingUsers = await get(ref(db, `blocks/${user.userId}`));

    const json = blockingUsers.toJSON();

    return json
      ? Object.entries(json).map((user) => ({
          userId: user[0],
          username: user[1],
        }))
      : [];
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const getBlockedUsers = async (user: User) => {
  try {
    const db = getDatabase(firebaseApp);
    const blockedUsers = await get(ref(db, `blocked/${user.userId}`));

    const json = blockedUsers.toJSON();

    return json ? Object.entries(json) : [];
  } catch (e) {
    console.log(e);
    return [];
  }
};

export const unblockUser = async (user: User, blockedUserId: string) => {
  const db = getDatabase(firebaseApp);
  await Promise.all([
    remove(ref(db, `blocks/${user.userId}/${blockedUserId}`)),
    remove(ref(db, `blocked/${blockedUserId}/${user.userId}`)),
  ]);
};
