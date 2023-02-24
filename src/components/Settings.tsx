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
import { useAppState } from "../useAppState";

const styles = StyleSheet.create({
  root: {
    backgroundColor: "#fff",
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
      <FlatList
        data={settings}
        renderItem={({ item }) => <SettingsItem {...item} />}
      />
    </SafeAreaView>
  );
};
