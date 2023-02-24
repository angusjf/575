// React navigation stack for the register screen

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { OnboardingScreen } from "./OnboardingScreen";
import { RegisterForm } from "./RegisterForm";

export type RegisterStackParamList = {
  Onboarding: undefined;
  Register: undefined;
};
const Stack = createStackNavigator();

export const RegisterStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterForm}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
