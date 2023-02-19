import { useMemo } from "react";
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

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#fff",
  },
});

type SettingsItemProps = {
  title: string;
  onPress: () => void;
};

const SettingsItem = ({ title, onPress }: SettingsItemProps) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        height: 42,
        borderColor: "lightgrey",
        borderBottomWidth: 1,
        justifyContent: "center",
      }}
    >
      <Text style={{ paddingHorizontal: 22 }}>{title}</Text>
    </View>
  </TouchableOpacity>
);

type SettingsProps = { logout: () => void; deleteAccount: () => void };

export const Settings = ({ logout, deleteAccount }: SettingsProps) => {
  const settings = useMemo(
    () => [
      { title: "Logout", onPress: logout },
      // { title: "Unblock users", onPress: () => undefined },
      { title: "Delete your account", onPress: deleteAccount },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.root}>
      <View>
        <FlatList
          data={settings}
          renderItem={({ item }) => <SettingsItem {...item} />}
        />
      </View>
    </SafeAreaView>
  );
};
