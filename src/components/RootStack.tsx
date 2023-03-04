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
        backgroundColor: "#f9f6f6",
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
        name="Compose"
        component={HaikuForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Feed"
        component={Feed}
        options={({ route }) => ({
          headerTransparent: true, // TODO: This isn't transparent anymore
          headerTitleAlign: "center",
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
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
