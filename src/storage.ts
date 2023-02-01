import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "575_username";

export const getUsernameFromStorage = async (): Promise<string | null> => {
  const username = await AsyncStorage.getItem(USERNAME_KEY);
  return username;
};

export const storeUsername = async (username: string) => {
  await AsyncStorage.setItem(USERNAME_KEY, username);
};

export const clear = () => {
  AsyncStorage.removeItem(USERNAME_KEY);
};
