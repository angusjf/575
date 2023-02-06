import * as SplashScreen from "expo-splash-screen";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { post, uploadExpoPushToken } from "./src/firebaseClient";
import { Feed } from "./src/components/Feed";
import { HaikuForm } from "./src/components/HaikuForm";
import { RegisterForm } from "./src/components/RegisterForm";
import { useAppState } from "./src/useAppState";
import { registerForPushNotificationsAsync } from "./src/components/useNotifications";
import * as Notifications from "expo-notifications";
import { Button } from "./src/components/Button";
import { firebaseApp } from "./src/firebase";
import { getAuth } from "firebase/auth";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const { state, setUsername, loadFeed, booting } = useAppState();

  const onLayoutRootView = useCallback(async () => {
    if (!booting) {
      await SplashScreen.hideAsync();
    }
  }, [booting]);

  if (booting) {
    return null;
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      {state.screen === "register" ? (
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
      ) : state.screen === "compose" ? (
        <HaikuForm
          publish={async (haiku) => {
            await post(state.username, haiku);
            loadFeed();
          }}
        />
      ) : state.screen === "feed" ? (
        <Feed days={state.days} />
      ) : state.screen === "loading_haiku" ? null : null}

      <Button
        title="log out"
        onPress={() => {
          const auth = getAuth(firebaseApp);
          auth.signOut();
        }}
      />
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
