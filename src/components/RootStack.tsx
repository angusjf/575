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

export const ONBOARDING_SCREEN_NAME = "Onboarding";

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
  return (
    <TouchableOpacity
      style={{
        marginLeft: "auto",
        marginRight: 5,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 50,
        backgroundColor: "black",
        height: 33,
        width: 33,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 20,
          color: "white",
        }}
      >
        設
      </Text>
    </TouchableOpacity>
  );
};

const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={{
        marginLeft: "auto",
        marginRight: 5,
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 50,
        backgroundColor: "black",
        height: 33,
        width: 33,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
    >
      <Text
        style={{
          fontSize: 20,
          color: "white",
        }}
      >
        ←︎
      </Text>
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
        name={ONBOARDING_SCREEN_NAME}
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Email"
        component={EmailForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Email" />,
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        })}
      />
      <Stack.Screen
        name="Register"
        component={RegisterForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Register" />,
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        })}
      />
      <Stack.Screen
        name="Login"
        component={LoginForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Welcome back" />,
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        })}
      />
      <Stack.Screen
        name="Sign"
        component={SignForm}
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Sign" />,
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
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
        options={({ navigation }) => ({
          headerTitle: () => <ScreenTitle title="Settings" />,
          gestureEnabled: true,
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        })}
      />
    </Stack.Navigator>
  );
};
