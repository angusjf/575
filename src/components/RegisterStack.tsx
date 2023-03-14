import {
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
} from "react-native";
import { fonts } from "../font";
import { useAppState } from "../useAppState";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HaikuLineInput } from "./HaikuLineInput";
import { FC, useMemo, useRef, useState } from "react";
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
import { RegisterStackParams } from "./RootStack";
import { QuestionMark } from "./icons/QuestionMark";
import BottomSheet from "@gorhom/bottom-sheet";
import { Erase } from "./icons/Erase";

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

export const RegisterForm: FC<RegisterFormProps> = ({ navigation, route }) => {
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

export const LoginForm: FC<LoginFormProps> = ({ navigation, route }) => {
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
const signatureWidth = 350;

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

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["50%"], []);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
          height: signatureHeight,
          width: signatureWidth,
          borderRadius: 7,
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
        <Whiteboard
          strokes={strokes}
          setStrokes={setStrokes}
          color={"#2c2a2a"}
          strokeWidth={4}
        />
      </View>
      <Button
        title="continue"
        onPress={handleNext}
        isLoading={validity == "loading"}
      />
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
            <Text style={styles.guideLine}>Hand-drawn signature,</Text>
            <Text style={styles.guideLine}>
              Displayed with your haiku verse,
            </Text>
            <Text style={styles.guideLine}>Unique and creative.</Text>
          </View>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
};
