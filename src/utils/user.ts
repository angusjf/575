import { User as FirebaseUser } from "firebase/auth";
import { User } from "../types";

export const firebaseUserToUser = (user: FirebaseUser): User => {
  if (user === null) return user;
  return {
    userId: user?.uid ?? "",
    username: user?.displayName ?? "",
    email: user?.email ?? "",
  };
};
