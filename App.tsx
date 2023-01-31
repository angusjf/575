import { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { fonts } from "./src/font";
import { HaikuForm } from "./src/HaikuForm";
import { RegisterForm } from "./src/RegisterForm";
import {
  getUsernameFromStorage,
  getTodaysHaikuFromStorage,
  storeTodaysHaiku,
  clear,
} from "./src/storage";
import { Day, Haiku } from "./src/types";
import { Feed } from "./src/Feed";
import { getDays, post } from "./firebaseClient";
import { Button } from "./src/Button";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    [fonts.PlexSerifRegular]: require("./assets/fonts/IBMPlexSerif-Regular.ttf"),
    [fonts.PlexSerifBoldItalic]: require("./assets/fonts/IBMPlexSerif-BoldItalic.ttf"),
  });

  const [username, setUsername] = useState<string | null>(null);
  const [todaysHaiku, setTodaysHaiku] = useState<Haiku | null>(null);
  const [days, setDays] = useState<Day[] | null>(null);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      const usernameFromStorage = await getUsernameFromStorage();
      if (usernameFromStorage) {
        setUsername(usernameFromStorage);

        const haikuFromStorage = await getTodaysHaikuFromStorage();
        if (haikuFromStorage) {
          setTodaysHaiku(haikuFromStorage);

          getDays().then(setDays);
        }
      }
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={styles.container}>
      {username === null ? (
        <>
          <RegisterForm setUsername={setUsername} />
          <Button title="clear storage" onPress={() => clear()} />
        </>
      ) : todaysHaiku === null ? (
        <HaikuForm
          publish={(haiku) => {
            setTodaysHaiku(haiku);
            post(username, haiku);
            storeTodaysHaiku(haiku);
            getDays().then(setDays);
          }}
        />
      ) : (
        <Feed days={days} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 600,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
