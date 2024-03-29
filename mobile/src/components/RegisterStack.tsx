import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  Linking,
} from "react-native";
import { fonts } from "../font";
import { useAppState } from "../useAppState";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HaikuLineInput } from "./HaikuLineInput";
import { FC, useEffect, useState } from "react";
import { Validity } from "../validity";
import { Button } from "./Button";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { firebaseApp } from "../firebase";
import { firebaseUserToUser } from "../utils/user";
import { convertStrokesToSvg, Stroke } from "./Signatures/Whiteboard";
import { getUser, registerUser } from "../firebaseClient";
import { RegisterStackParams } from "./RootStack";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH, TOS_URL } from "../utils/consts";
import { Signature } from "./Signatures/Signature";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 15,
  },
  guideTitle: {
    fontFamily: fonts.PlexMonoBold,
    fontSize: 20,
  },
  guideContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  guideLine: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 16,
    marginTop: 10,
    lineHeight: 28,
  },
  smallLinkText: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 10,
    marginTop: 15,
    maxWidth: 200,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  errorMessage: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 10,
    marginTop: 15,
    maxWidth: 200,
    textAlign: "center",
    color: "red",
  },
});

type EmailFormProps = NativeStackScreenProps<RegisterStackParams, "Email">;

export const EmailForm: FC<EmailFormProps> = ({ navigation }) => {
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
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HaikuLineInput
        placeholder="the email address you use"
        value={email || ""}
        onChangeText={setEmail}
        validity={validity}
        length={7}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        importantForAutofill="yes"
        autoFocus
        multiline={false}
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

export const RegisterForm: FC<RegisterFormProps> = ({ navigation, route }) => {
  const [password, setPassword] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");
  const [errorMessage, setErrorMessage] = useState("");

  const handleNext = () => {
    if (password === "") {
      setValidity("invalid");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("password must be at least 6 characters");
      setValidity("invalid");
      return;
    }
    try {
      navigation.navigate("Sign", { ...route.params, password });
    } catch (error: any) {
      setValidity("invalid");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HaikuLineInput
        placeholder="a secret password"
        value={password || ""}
        onChangeText={setPassword}
        validity={validity}
        length={7}
        secureTextEntry={true}
        multiline={false}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        importantForAutofill="yes"
        autoFocus
      />
      {errorMessage !== "" && (
        <View>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      )}
      <Button
        title="continue"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
    </KeyboardAvoidingView>
  );
};

type LoginFormProps = NativeStackScreenProps<RegisterStackParams, "Login">;

export const LoginForm: FC<LoginFormProps> = ({ navigation, route }) => {
  const [password, setPassword] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordResetTime, setPasswordResetTime] = useState(0);
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
      register(firebaseUserToUser(user.user, poet.signature, 0, []));
    } catch (error: any) {
      if (error.code === "auth/wrong-password") {
        setErrorMessage("wrong password");
      }
      setValidity("invalid");
    }
  };

  const handlePasswordReset = async () => {
    if (passwordResetTime > 0) {
      return;
    }
    const auth = getAuth(firebaseApp);
    try {
      console.log("sending password reset email");
      sendPasswordResetEmail(auth, route.params.email);
      setPasswordResetTime(60);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (passwordResetTime === 0) {
      return;
    }
    const interval = setInterval(() => {
      setPasswordResetTime((time) => time - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [passwordResetTime]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <HaikuLineInput
        placeholder="a secret password"
        value={password || ""}
        onChangeText={setPassword}
        validity={validity}
        length={7}
        secureTextEntry={true}
        multiline={false}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="password"
        importantForAutofill="yes"
        autoFocus
      />
      {errorMessage !== "" && (
        <View>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      )}
      <Button
        title="continue"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
      <TouchableOpacity onPress={handlePasswordReset}>
        <Text style={styles.smallLinkText}>
          {passwordResetTime === 0
            ? "Forgot password? Tap here to reset it."
            : `Check your email for a password reset link. Retry in ${passwordResetTime}s`}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

type SignFormParams = NativeStackScreenProps<RegisterStackParams, "Sign">;

export const SignForm: FC<SignFormParams> = ({ navigation, route }) => {
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
      width: SIGNATURE_HEIGHT,
      height: SIGNATURE_WIDTH,
    });
    try {
      setValidity("loading");
      console.log(route.params);
      await createUserWithEmailAndPassword(
        auth,
        route.params.email,
        route.params.password
      );
      if (auth.currentUser === null) {
        throw new Error("No user");
      }
      await updateProfile(auth.currentUser, { displayName: name });
      const user = firebaseUserToUser(auth.currentUser, signature, 0, []);
      await registerUser(user);
      register(user);
      setValidity("unchecked");
    } catch (error: any) {
      setValidity("invalid");
    }
  };

  return (
    <View style={styles.root}>
      <HaikuLineInput
        placeholder="how do you sign your poems?"
        value={name || ""}
        onChangeText={setName}
        validity={validity}
        length={7}
        multiline={false}
        autoComplete="name"
      />
      <Signature strokes={strokes} setStrokes={setStrokes} />
      <Button
        title="finish"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
      <TouchableOpacity onPress={() => Linking.openURL(TOS_URL)}>
        <Text style={styles.smallLinkText}>
          By registering, you are accepting 575's terms of service.
        </Text>
      </TouchableOpacity>
    </View>
  );
};
