import { User as FirebaseUser } from "firebase/auth";
import { User } from "../types";

export const firebaseUserToUser = (
  user: FirebaseUser,
  signature: string
): User => {
  if (user === null) return user;
  return {
    userId: user?.uid ?? "",
    username: user?.displayName ?? "",
    email: user?.email ?? "",
    avatar:
      user?.photoURL ??
      "https://firebasestorage.googleapis.com/v0/b/app-3cc36.appspot.com/o/defaultAvatar1.png?alt=media&token=cc112f8e-5cd2-40e6-99a7-44c75da58c6a",

    signature: signature,
  };
};
