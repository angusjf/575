import { useCallback, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { FiveSevenFive } from "./src/FiveSevenFive";
import { fonts } from "./src/font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HaikuForm } from "./src/HaikuForm";
import { RegisterForm } from "./src/RegisterForm";
import { USERNAME_KEY } from "./src/consts";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    [fonts.PlexSerifRegular]: require("./assets/fonts/IBMPlexSerif-Regular.ttf"),
    [fonts.PlexSerifBoldItalic]: require("./assets/fonts/IBMPlexSerif-BoldItalic.ttf"),
  });

  const [username, setUsername] = useState<string | null>(null);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      const username = await AsyncStorage.getItem(USERNAME_KEY);
      setUsername(username);
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={styles.container}>
      {username !== null ? (
        <HaikuForm username={username} />
      ) : (
        <RegisterForm
          setUsername={async (newUsername) => {
            setUsername(newUsername);
          }}
        />
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
