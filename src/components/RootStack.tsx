import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../font";
import { Feed } from "./Feed";
import { Settings } from "./Settings";
import { useAppState } from "../useAppState";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HaikuForm } from "./HaikuForm";
import { OnboardingScreen } from "./OnboardingScreen";
import { EmailForm, LoginForm, RegisterForm, SignForm } from "./RegisterStack";
import { FiveSevenFive } from "./FiveSevenFive";
import { SmallButton } from "./SmallButton";

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

export const ONBOARDING_SCREEN_NAME = "Onboarding";

const Stack = createNativeStackNavigator<RootStackParams>();

const white = "rgba(255, 255, 255, 255)";
const transparent = "rgba(255, 255, 255, 0)";

const headerBackground = () => (
  <LinearGradient
    start={{ x: 0, y: 0.5 }}
    end={{ x: 0, y: 1 }}
    colors={[white, transparent]}
    style={{ flex: 1 }}
  />
);

const ScreenTitle = ({ title }: { title: string }) => (
  <Text
    style={{
      fontFamily: fonts.PlexSansBoldItalic,
      fontSize: 28,
    }}
  >
    {title}
  </Text>
);

export const RootStack = () => {
  const { state, openSettings } = useAppState();

  if (state.loading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerLeft: () => {
          if (Platform.OS === "ios")
            return (
              <SmallButton onPress={() => navigation.goBack()}>←</SmallButton>
            );
        },
      })}
    >
      <Stack.Screen
        name={ONBOARDING_SCREEN_NAME}
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Email"
        component={EmailForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Email" />,
        })}
      />
      <Stack.Screen
        name="Register"
        component={RegisterForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Register" />,
        })}
      />
      <Stack.Screen
        name="Login"
        component={LoginForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Welcome back" />,
        })}
      />
      <Stack.Screen
        name="Sign"
        component={SignForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Sign" />,
        })}
      />
      <Stack.Screen
        name="Compose"
        component={HaikuForm}
        options={({ route }) => ({
          headerTransparent: true,
          headerTitle: "",
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null,
          headerRight: () =>
            route.name === "Compose" ? (
              <SmallButton onPress={() => openSettings()}>設</SmallButton>
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
          headerLeft: () => null,
          headerBackground,
          headerTitle: () => <FiveSevenFive fontSize={27} marginTop={0} />,
          headerRight: () =>
            route.name === "Feed" ? (
              <SmallButton onPress={() => openSettings()}>設</SmallButton>
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
