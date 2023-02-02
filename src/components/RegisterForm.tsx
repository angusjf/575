import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { HaikuLineInput } from "./HaikuLineInput";
import { Validity } from "../Validity";
import { fonts } from "../font";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { firebaseApp } from "../firebase";

export const RegisterForm = ({
  setUsername,
}: {
  setUsername: (username: string) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged((user) => {
      if (user) {
        setUsername(user.displayName ?? "");
      }
    });
    return subscriber;
  }, []);

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
        onChangeText={(text) => {
          setName(text);
        }}
        validity={validity}
        long
      />
      <HaikuLineInput
        placeholder="the email address you use"
        value={email || ""}
        onChangeText={(text) => {
          setEmail(text);
        }}
        validity={validity}
        long
      />
      <HaikuLineInput
        placeholder="a secret password"
        value={password || ""}
        onChangeText={(text) => {
          setPassword(text);
        }}
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
