import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../font";
import { Feed } from "./Feed";
import { Settings } from "./Settings";
import { useAppState } from "../useAppState";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HaikuForm } from "./HaikuForm";
import { OnboardingScreen } from "./OnboardingScreen";
import { EmailForm, LoginForm, RegisterForm, SignForm } from "./RegisterStack";

export type RegisterStackParams = {
  Email: undefined;
  Login: { email: string };
  Register: { email: string };
  Sign: { email: string; password: string };
};

export type RootStackParams = RegisterStackParams & {
  Feed: undefined;
  Settings: undefined;
  Compose: undefined;
  Loading: undefined;
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<RootStackParams>();

const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.PlexSerifBoldItalic,
    fontSize: 32,
  },
});

const white = "rgba(255, 255, 255, 255)";
const transparent = "rgba(255, 255, 255, 0)";

const headerBackground = () => (
  <LinearGradient colors={[white, white, transparent]} style={{ flex: 1 }} />
);

const ScreenTitle = ({ title }: { title: string }) => (
  <Text
    style={{
      fontFamily: fonts.PlexSerifBoldItalic,
      fontSize: 28,
    }}
  >
    {title}
  </Text>
);

const HeaderRight = ({ onPress }: { onPress: () => void }) => {
  const { state } = useAppState();
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

  if (state.loading) {
    return null;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Email"
        component={EmailForm}
        options={{ headerTitle: () => <ScreenTitle title="Email" /> }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterForm}
        options={{ headerTitle: () => <ScreenTitle title="Register" /> }}
      />
      <Stack.Screen
        name="Login"
        component={LoginForm}
        options={{ headerTitle: () => <ScreenTitle title="Welcome back" /> }}
      />
      <Stack.Screen
        name="Sign"
        component={SignForm}
        options={{ headerTitle: () => <ScreenTitle title="Sign" /> }}
      />
      <Stack.Screen
        name="Compose"
        component={HaikuForm}
        options={({ route }) => ({
          headerTransparent: true,
          headerTitle: "",
          headerBackVisible: false,
          gestureEnabled: false,
          headerRight: () =>
            route.name === "Compose" ? (
              <HeaderRight onPress={() => openSettings()} />
            ) : null,
        })}
      />
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={({ route }) => ({
          headerTransparent: true,
          headerTitleAlign: "center",
          headerBackVisible: false,
          headerBackground,
          headerTitle: () => <Text style={styles.logo}>575</Text>,
          headerRight: () =>
            route.name === "Feed" ? (
              <HeaderRight onPress={() => openSettings()} />
            ) : null,
          gestureEnabled: false,
        })}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: () => <ScreenTitle title="Settings" />,
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};
