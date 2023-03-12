import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../font";
import { Feed } from "./Feed";
import { Settings } from "./Settings";
import { useAppState } from "../useAppState";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HaikuForm } from "./HaikuForm";
import { OnboardingScreen } from "./OnboardingScreen";
import { RegisterStack } from "./RegisterStack";

export type RootStackParams = {
  Feed: undefined;
  Settings: undefined;
  Compose: undefined;
  RegisterStack: undefined;
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
          gestureEnabled: false,
        })}
      />
      <Stack.Screen
        name="RegisterStack"
        component={RegisterStack}
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
