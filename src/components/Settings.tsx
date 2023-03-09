import { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useAppState } from "../useAppState";
import Dialog from "react-native-dialog";

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#f9f6f6",
    flex: 1,
  },
});

type SettingsItemProps = {
  title: string;
  onPress: () => void;
};

const SettingsItem = ({ title, onPress }: SettingsItemProps) => (
  <View
    style={{
      borderColor: "lightgrey",
      borderBottomWidth: 1,
      justifyContent: "center",
    }}
  >
    <TouchableOpacity
      onPress={onPress}
      style={{
        height: 52,
        justifyContent: "center",
      }}
    >
      <Text style={{ paddingHorizontal: 22 }}>{title}</Text>
    </TouchableOpacity>
  </View>
);

export const Settings = () => {
  const { logout, deleteAccount } = useAppState();
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const settings = useMemo(
    () => [
      { title: "Logout", onPress: logout },
      { title: "Unblock users", onPress: () => undefined },
      {
        title: "Delete your account",
        onPress: () => setVisible(true),
      },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={settings}
        renderItem={({ item }) => <SettingsItem {...item} />}
      />
      <Dialog.Container visible={visible}>
        <Dialog.Title>Delete Account</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to delete your account? You cannot undo this
          action. Please enter your password to confirm.
        </Dialog.Description>
        <Dialog.Input
          placeholder="Current password"
          secureTextEntry
          multiline={false}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          importantForAutofill="yes"
          onChangeText={setPassword}
        />
        <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
        <Dialog.Button
          onPress={() => deleteAccount(password)}
          label="Delete"
          bold
        />
      </Dialog.Container>
    </SafeAreaView>
  );
};
