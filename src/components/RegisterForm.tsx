import { StyleSheet, Text, View } from "react-native";
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

const styles = StyleSheet.create({
  root: {
    height: 600,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

export const RegisterForm = ({
  register: register,
}: {
  register: (username: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");

  const handleCreateAccount = async () => {
    const auth = getAuth(firebaseApp);
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setValidity("loading");
      register(name);
      await updateProfile(userCredentials.user, { displayName: name });
      await registerUser(userCredentials.user.uid);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          register(name);
        } catch {
          setValidity("invalid");
        }
      }
      setValidity("invalid");
    }
  };

  return (
    <View style={styles.root}>
      <Text style={{ fontFamily: fonts.PlexMonoItalic, fontSize: 15 }}>
        how do you sign your poems?
      </Text>
      <HaikuLineInput
        placeholder="how you sign your work"
        value={name || ""}
        onChangeText={setName}
        validity={validity}
        long
      />
      <HaikuLineInput
        placeholder="the email address you use"
        value={email || ""}
        onChangeText={setEmail}
        validity={validity}
        long
      />
      <HaikuLineInput
        placeholder="a secret password"
        value={password || ""}
        onChangeText={setPassword}
        validity={validity}
        long
        secureTextEntry={true}
        multiline={false}
      />
      <Button
        title="continue"
        onPress={handleCreateAccount}
        isLoading={validity == "loading"}
      />
    </View>
  );
};
