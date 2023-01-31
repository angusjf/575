import AsyncStorage from "@react-native-async-storage/async-storage";
import { Haiku } from "./haiku";

const USERNAME_KEY = "575_username";
const TODAYS_HAIKU_KEY = "575_todays_haiku";

export const getUsernameFromStorage = async (): Promise<string | null> => {
  const username = await AsyncStorage.getItem(USERNAME_KEY);
  return username;
};

export const storeUsername = async (username: string) => {
  await AsyncStorage.setItem(USERNAME_KEY, username);
};

export const getTodaysHaikuFromStorage = async (): Promise<Haiku | null> => {
  const haiku = await AsyncStorage.getItem(TODAYS_HAIKU_KEY);
  if (haiku === null) {
    return null;
  }
  const split = haiku.split("\n");
  return [split[0], split[1], split[2]];
};

export const storeTodaysHaiku = async (haiku: Haiku) => {
  await AsyncStorage.setItem(TODAYS_HAIKU_KEY, haiku.join("\n"));
};

export const clear = () => {
  AsyncStorage.removeItem(USERNAME_KEY);
  AsyncStorage.removeItem(TODAYS_HAIKU_KEY);
};
