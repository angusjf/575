import { Text, View } from "react-native";
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

export const RegisterForm = ({
  register,
}: {
  register: (username: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const [name, setName] = useState("");
  const [validity, setValidity] = useState<Validity>("unchecked");

  return (
    <View>
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
