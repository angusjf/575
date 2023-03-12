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

export type RootStackParams = {
  Feed: undefined;
  Settings: undefined;
  Compose: undefined;
  Register: undefined;
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

export const RootStack = () => {
  const { state, openSettings } = useAppState();

  if (state.loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ gestureEnabled: false }}>
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Compose"
        component={HaikuForm}
        options={({ route }) => ({
          headerTransparent: true,
          headerTitle: "",
          headerBackVisible: false,
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
        })}
      />
      <Stack.Screen
        name="Register"
        component={RegisterForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerTitle: () => (
            <Text
              style={{ fontFamily: fonts.PlexSerifBoldItalic, fontSize: 28 }}
            >
              Settings
            </Text>
          ),
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};
