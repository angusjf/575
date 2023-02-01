import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { hasPostedToday, post } from "./src/firebaseClient";
import { Feed } from "./src/components/Feed";
import { useLoadFonts } from "./src/font";
import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { getUsernameFromStorage, storeUsername } from "./src/storage";
import { useAppState } from "./src/useAppState";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const fontsLoaded = useLoadFonts();

  const { state, setUsername, loadFeed } = useAppState();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      const usernameFromStorage = await getUsernameFromStorage();
      if (usernameFromStorage) {
        setUsername(usernameFromStorage);

        const hasPosted = await hasPostedToday(usernameFromStorage);
        if (hasPosted) {
          loadFeed();
        }
      }
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      {state.screen == "register" ? (
        <RegisterForm
          setUsername={(username) => {
            setUsername(username);
            storeUsername(username);
          }}
        />
      ) : state.screen == "compose" ? (
        <HaikuForm
          publish={async (haiku) => {
            await post(state.username, haiku);
            loadFeed();
          }}
        />
      ) : (
        <Feed days={state.days} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 600,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
