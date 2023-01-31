import { getDatabase, ref, set, get, child } from "firebase/database";
import { firebaseApp } from "./firebase";

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
    return snapshot.exists();
  });
};
