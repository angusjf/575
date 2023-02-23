import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity, Image, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../font";
import { Feed } from "./Feed";
import { Settings } from "./Settings";
import { useAppState } from "../useAppState";

export type FeedStackParams = {
  Feed: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<FeedStackParams>();

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

export const FeedStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Feed"
          component={Feed}
          options={({ navigation }) => ({
            headerTransparent: true,
            headerBackground,
            headerTitle: () => <Text style={styles.logo}>575</Text>,
            headerRight: () => (
              <HeaderRight onPress={() => navigation.navigate("Settings")} />
            ),
          })}
        />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
