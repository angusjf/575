import { User as FirebaseUser } from "firebase/auth";
import { User } from "../types";

export const firebaseUserToUser = (user: FirebaseUser | null): User => ({
  userId: user?.uid ?? "",
  username: user?.displayName ?? "",
  email: user?.email ?? "",
});
