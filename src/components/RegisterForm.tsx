import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { Button } from "./Button";
import { HaikuLineInput } from "./HaikuLineInput";
import { Validity } from "../Validity";
import { fonts } from "../font";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { firebaseApp } from "../firebase";
import { registerUser } from "../firebaseClient";
import { firebaseUserToUser } from "../utils/user";
import { useAppState } from "../useAppState";
import { convertStrokesToSvg, Stroke, Whiteboard } from "./Whiteboard";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f9f6f6",
    alignItems: "center",
    justifyContent: "center",
  },
});

const signatureHeight = 200;
const signatureWidth = 400;

export const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  const { register } = useAppState();

  const handleCreateAccount = async () => {
    const auth = getAuth(firebaseApp);
    const signature = convertStrokesToSvg(strokes, {
      width: signatureWidth,
      height: signatureHeight,
    });
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setValidity("loading");
      await updateProfile(userCredentials.user, { displayName: name });
      await registerUser(firebaseUserToUser(userCredentials.user, signature));
      register(firebaseUserToUser(userCredentials.user, signature));
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        try {
          const user = await signInWithEmailAndPassword(auth, email, password);
          register(firebaseUserToUser(user.user, signature));
        } catch {
          setValidity("invalid");
        }
      }
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
          marginBottom: 40,
        }}
      >
        <Whiteboard
          strokes={strokes}
          setStrokes={setStrokes}
          color={"#2c2a2a"}
          strokeWidth={4}
        />
      </View>
      <Button title="clear" onPress={() => setStrokes([])} />
      <HaikuLineInput
        placeholder="preferred signature"
        autoFocus
        value={name || ""}
        onChangeText={setName}
        validity={validity}
        long
        autoComplete="name"
      />
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
      />
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
      />
      <Button
        title="continue"
        onPress={handleCreateAccount}
        isLoading={validity == "loading"}
      />
    </KeyboardAvoidingView>
  );
};
