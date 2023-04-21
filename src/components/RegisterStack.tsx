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
import { FC, useEffect, useMemo, useRef, useState } from "react";
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
import { convertStrokesToSvg, Stroke, Whiteboard } from "./Whiteboard";
import { getUser, registerUser } from "../firebaseClient";
import { RegisterStackParams } from "./RootStack";
import { QuestionMark } from "./icons/QuestionMark";
import BottomSheet from "@gorhom/bottom-sheet";
import { Erase } from "./icons/Erase";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH, TOS_URL } from "../utils/consts";

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
        long
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
        long
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
      register(firebaseUserToUser(user.user, poet.signature, 0));
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
        long
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
      const user = firebaseUserToUser(auth.currentUser, signature, 0);
      await registerUser(user);
      register(user);
      setValidity("unchecked");
    } catch (error: any) {
      setValidity("invalid");
    }
  };

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["50%"], []);

  return (
    <View style={styles.root}>
      <HaikuLineInput
        placeholder="how do you sign your poems?"
        value={name || ""}
        onChangeText={setName}
        validity={validity}
        long
        multiline={false}
        autoComplete="name"
      />
      <View
        style={{
          backgroundColor: "rgb(245, 242, 242)",
          height: SIGNATURE_HEIGHT,
          width: SIGNATURE_WIDTH,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 5,
            top: 5,
            zIndex: 2,
          }}
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <QuestionMark size={25} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: "absolute",
            left: 5,
            top: 5,
            zIndex: 2,
          }}
          onPress={() => setStrokes([])}
        >
          <Erase size={25} />
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: "rgb(245, 242, 242)",
            height: SIGNATURE_HEIGHT,
            width: SIGNATURE_WIDTH,
            borderRadius: SIGNATURE_HEIGHT / 2,
            overflow: "hidden",
          }}
        >
          <Whiteboard
            strokes={strokes}
            setStrokes={setStrokes}
            color={"#2c2a2a"}
            strokeWidth={4}
          />
        </View>
      </View>
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
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        style={{
          shadowColor: "#000",
          backgroundColor: "white",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.guideTitle}>Sign your Haikus</Text>
          <View style={styles.guideContainer}>
            <Text style={styles.guideLine}>Hand-drawn self-portrait,</Text>
            <Text style={styles.guideLine}>
              Displayed with your haiku verse,
            </Text>
            <Text style={styles.guideLine}>Unique and creative.</Text>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
};
