import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../font";
import { Feed } from "./Feed";
import { Settings } from "./Settings";
import { useAppState } from "../useAppState";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { HaikuForm } from "./HaikuForm";
import { OnboardingScreen } from "./OnboardingScreen";
import { HaikuLineInput } from "./HaikuLineInput";
import { FC, useState } from "react";
import { Validity } from "../validity";
import { Button } from "./Button";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { firebaseApp } from "../firebase";
import { firebaseUserToUser } from "../utils/user";
import { convertStrokesToSvg, Stroke, Whiteboard } from "./Whiteboard";
import { getUser, registerUser } from "../firebaseClient";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
});

export type RegisterStackParams = {
  Email: undefined;
  Login: { email: string };
  Register: { email: string };
  Sign: { email: string; password: string };
};

const Stack = createNativeStackNavigator<RegisterStackParams>();

export const RegisterStack = () => {
  const { state } = useAppState();

  if (state.loading) {
    return null;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen name="Email" component={EmailForm} />
      <Stack.Screen name="Register" component={RegisterForm} />
      <Stack.Screen name="Login" component={LoginForm} />
      <Stack.Screen name="Sign" component={SignForm} />
    </Stack.Navigator>
  );
};

type EmailFormProps = NativeStackScreenProps<RegisterStackParams, "Email">;

const EmailForm: FC<EmailFormProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");

  const handleNext = async () => {
    if (email === "") {
      setValidity("invalid");
      return;
    }
    const auth = getAuth(firebaseApp);
    try {
      setValidity("loading");
      const availableAuthMethods = await fetchSignInMethodsForEmail(
        auth,
        email
      );
      setValidity("unchecked");
      if (availableAuthMethods.length === 0) {
        navigation.navigate("Register", { email });
        return;
      }
      navigation.navigate("Login", { email });
      return;
    } catch (error: any) {
      setValidity("invalid");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root}>
      <HaikuLineInput
        placeholder="the email address you use"
        value={email || ""}
        onChangeText={setEmail}
        validity={validity}
        long
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        importantForAutofill="yes"
        autoFocus
      />
      <Button
        title="continue"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
    </KeyboardAvoidingView>
  );
};

type RegisterFormProps = NativeStackScreenProps<
  RegisterStackParams,
  "Register"
>;

const RegisterForm: FC<RegisterFormProps> = ({ navigation, route }) => {
  const [password, setPassword] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");

  const handleNext = async () => {
    if (password === "") {
      setValidity("invalid");
      return;
    }
    const auth = getAuth(firebaseApp);
    try {
      setValidity("loading");
      await createUserWithEmailAndPassword(auth, route.params.email, password);
      setValidity("unchecked");
      navigation.navigate("Sign", { email: route.params.email, password });
    } catch (error: any) {
      setValidity("invalid");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root}>
      <HaikuLineInput
        placeholder="a secret password"
        value={password || ""}
        onChangeText={setPassword}
        validity={validity}
        long
        secureTextEntry={true}
        multiline={false}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        importantForAutofill="yes"
        autoFocus
      />
      <Button
        title="continue"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
    </KeyboardAvoidingView>
  );
};

type LoginFormProps = NativeStackScreenProps<RegisterStackParams, "Login">;

const LoginForm: FC<LoginFormProps> = ({ navigation, route }) => {
  const [password, setPassword] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");
  const { register } = useAppState();

  const handleNext = async () => {
    if (password === "") {
      setValidity("invalid");
      return;
    }
    const auth = getAuth(firebaseApp);
    try {
      setValidity("loading");
      const user = await signInWithEmailAndPassword(
        auth,
        route.params.email,
        password
      );
      const poet = await getUser(user.user);
      setValidity("unchecked");
      register(firebaseUserToUser(user.user, poet.signature));
    } catch (error: any) {
      setValidity("invalid");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root}>
      <HaikuLineInput
        placeholder="a secret password"
        value={password || ""}
        onChangeText={setPassword}
        validity={validity}
        long
        secureTextEntry={true}
        multiline={false}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        importantForAutofill="yes"
        autoFocus
      />
      <Button
        title="continue"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
    </KeyboardAvoidingView>
  );
};

type SignFormParams = NativeStackScreenProps<RegisterStackParams, "Sign">;

const signatureHeight = 200;
const signatureWidth = 400;

const SignForm: FC<SignFormParams> = ({ navigation, route }) => {
  const [name, setName] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const { register } = useAppState();

  const handleNext = async () => {
    if (name === "") {
      setValidity("invalid");
      return;
    }
    const auth = getAuth(firebaseApp);
    const signature = convertStrokesToSvg(strokes, {
      width: signatureWidth,
      height: signatureHeight,
    });
    if (auth.currentUser === null) {
      navigation.goBack();
      return;
    }
    try {
      setValidity("loading");
      await updateProfile(auth.currentUser, { displayName: name });
      await registerUser(firebaseUserToUser(auth.currentUser, signature));
      register(firebaseUserToUser(auth.currentUser, signature));
      setValidity("unchecked");
    } catch (error: any) {
      setValidity("invalid");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View>
        <Text
          style={{
            fontFamily: fonts.PlexMonoItalic,
            fontSize: 21,
            paddingBottom: 38,
          }}
        >
          how do you sign your poems?
        </Text>
      </View>
      <View
        style={{
          backgroundColor: "rgb(216, 200, 200)",
          height: signatureHeight,
          width: signatureWidth,
        }}
      >
        <Whiteboard
          strokes={strokes}
          setStrokes={setStrokes}
          color={"#2c2a2a"}
          strokeWidth={4}
        />
      </View>
      <Button
        title="clear"
        onPress={() => setStrokes([])}
        style={{
          marginBottom: 40,
        }}
      />
      <HaikuLineInput
        placeholder="preferred signature"
        value={name || ""}
        onChangeText={setName}
        validity={validity}
        long
        autoComplete="name"
      />
      <Button
        title="continue"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
    </KeyboardAvoidingView>
  );
};
