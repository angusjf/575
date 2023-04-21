import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useAppState } from "../useAppState";
import Dialog from "react-native-dialog";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { fonts } from "../font";

const styles = StyleSheet.create({
  root: {
    backgroundColor: "white",
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
  },
  line: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 15,
    marginBottom: 7,
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
      <Text style={{ paddingHorizontal: 22, fontFamily: fonts.PlexMonoItalic }}>
        {title}
      </Text>
    </TouchableOpacity>
  </View>
);

export const Settings = () => {
  const { logout, deleteAccount, state, unblockUser } = useAppState();
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ["50%", "60%"], []);

  const settings = useMemo(
    () => [
      { title: `Logout of ${state.user?.username}`, onPress: logout },
      {
        title: "Unblock users",
        onPress: () => bottomSheetRef.current?.expand(),
      },
      {
        title: "Delete your account",
        onPress: () => setVisible(true),
      },
    ],
    [logout, state.user?.username]
  );

  const BLOCKED_USERS = state.blockedUsers;
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
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        style={{
          backgroundColor: "white",
          shadowColor: "#000",
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
          {state.blockedUsers && state.blockedUsers.length > 0 ? (
            <BottomSheetFlatList
              data={BLOCKED_USERS}
              renderItem={({ item }) => (
                <BlockedUser
                  name={item.username}
                  unblock={() => unblockUser(item.userId)}
                />
              )}
              refreshing={false}
              style={{ width: "100%" }}
              horizontal={false}
            />
          ) : (
            <View
              style={{
                alignItems: "center",
                width: "100%",
              }}
            >
              <Text style={styles.line}>A calm Haiku app,</Text>
              <Text style={styles.line}>No blocked users found within,</Text>
              <Text style={styles.line}>Peaceful user's life.</Text>
            </View>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const BlockedUser = ({
  name,
  unblock,
}: {
  name: string;
  unblock: () => void;
}) => {
  return (
    <View
      style={{
        borderColor: "lightgrey",
        borderBottomWidth: 1,
        justifyContent: "space-between",
        flex: 1,
        flexDirection: "row",
        paddingHorizontal: 22,
        alignItems: "center",
        paddingVertical: 7,
      }}
    >
      <Text
        style={{
          fontSize: 21,
          fontFamily: fonts.PlexMonoItalic,
        }}
      >
        {name}
      </Text>
      <TouchableOpacity onPress={unblock}>
        <Text
          style={{
            fontSize: 30,
            fontFamily: fonts.PlexMonoBold,
          }}
        >
          ⨯
        </Text>
      </TouchableOpacity>
    </View>
  );
};
