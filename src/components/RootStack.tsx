import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../font";
import { Feed } from "./Feed";
import { Settings } from "./Settings";
import { useAppState } from "../useAppState";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HaikuForm } from "./HaikuForm";
import { RegisterForm } from "./RegisterForm";
import { OnboardingScreen } from "./OnboardingScreen";

export type FeedStackParams = {
  Feed: undefined;
  Settings: undefined;
  Compose: undefined;
  Register: undefined;
  Loading: undefined;
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<FeedStackParams>();

const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.PlexSerifBoldItalic,
    fontSize: 32,
    marginLeft: "auto",
  },
});

const white = "rgba(255, 255, 255, 255)";
const transparent = "rgba(255, 255, 255, 0)";

const headerBackground = () => (
  <LinearGradient colors={[white, white, transparent]} style={{ flex: 1 }} />
);

const HeaderRight = ({ onPress }: { onPress: () => void }) => {
  const { state } = useAppState();
  if (state.state !== "feed") return null;
  return (
    <TouchableOpacity
      style={{
        marginLeft: "auto",
        marginRight: 10,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 50,
        padding: 1,
        backgroundColor: "white",
      }}
      onPress={onPress}
    >
      <Image
        source={{ uri: state.user?.avatar }}
        style={{
          height: 30,
          width: 30,
        }}
      />
    </TouchableOpacity>
  );
};

export const RootStack = () => {
  const { state, openSettings } = useAppState();

  if (state.state === "finding_out_if_posted" || state.state === "loading") {
    return null;
  }

  return (
    <Stack.Navigator>
      {state.state === "onboarding" ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : state.state === "compose" ? (
        <Stack.Screen name="Compose" component={HaikuForm} />
      ) : state.state === "feed" ? (
        <Stack.Screen
          name="Feed"
          component={Feed}
          options={() => ({
            headerTransparent: true,
            headerTitleAlign: "center",
            headerBackground,
            headerTitle: () => <Text style={styles.logo}>575</Text>,
            headerRight: () => <HeaderRight onPress={() => openSettings()} />,
          })}
        />
      ) : state.state === "register" ? (
        <Stack.Screen name="Register" component={RegisterForm} />
      ) : state.state === "settings" ? (
        <Stack.Screen name="Settings" component={Settings} />
      ) : null}
    </Stack.Navigator>
  );
};
