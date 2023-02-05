import { Text, View } from "react-native";
import { useState } from "react";
import { Button } from "./Button";
import { HaikuLineInput } from "./HaikuLineInput";
import { Validity } from "../Validity";
import { fonts } from "../font";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export const RegisterForm = ({
  setUsername,
}: {
  setUsername: (username: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateAccount = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        setValidity("loading");
        setUsername(name);
        await updateProfile(userCredential.user, { displayName: name });
      })
      .catch(async (error) => {
        if (error.code === "auth/email-already-in-use") {
          await signInWithEmailAndPassword(auth, email, password);
          setUsername(name);
          return;
        }
        console.error(error.code);
        setValidity("invalid");
      });
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
        onPress={() => handleCreateAccount()}
        isLoading={validity == "loading"}
      />
    </View>
  );
};
