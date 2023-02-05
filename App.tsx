import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  hasPostedToday,
  post,
  uploadExpoPushToken,
} from "./src/firebaseClient";
import { Feed } from "./src/components/Feed";
import { useLoadFonts } from "./src/font";
import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { useAppState } from "./src/useAppState";
import { registerForPushNotificationsAsync } from "./src/components/useNotifications";
import * as Notifications from "expo-notifications";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const fontsLoaded = useLoadFonts();

  const { state, setUsername, loadFeed } = useAppState();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
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
            registerForPushNotificationsAsync().then((token) => {
              if (token) {
                uploadExpoPushToken({ userId: username, token });
              }
            });
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
