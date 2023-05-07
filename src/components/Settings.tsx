import { forwardRef, useMemo, useRef, useState } from "react";
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
import { Signature } from "./Signatures/Signature";
import {
  convertStrokesToSvg,
  convertSvgToStrokes,
  Stroke,
} from "./Signatures/Whiteboard";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from "../utils/consts";
import { Button } from "./Button";
import { BlockedUser as BlockedUserType } from "../types";
import { Calendar } from "./Calendar";

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
  signatureContainer: {
    borderRadius: 50,
    borderWidth: 0.5,
    borderColor: "#000",
    marginRight: 10,
    overflow: "hidden",
    backgroundColor: "transparent",
    height: 40,
    width: 40,
  },
});

type SettingsItemProps = {
  title: string;
  onPress: () => void;
  firstItem: boolean;
};

const SettingsItem = ({ title, onPress, firstItem }: SettingsItemProps) => (
  <View
    style={{
      borderColor: "lightgrey",
      borderTopWidth: firstItem ? 1 : 0,
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
  const {
    logout,
    deleteAccount,
    state,
    unblockUser,
    updateSignature,
    updateUsername,
  } = useAppState();
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [isUpdateUsernameDialogOpen, setIsUpdateUsernameDialogOpen] =
    useState(false);

  const unblockSheetRef = useRef<BottomSheet>(null);
  const signatureSheetRef = useRef<BottomSheet>(null);

  const closeSheets = () => {
    unblockSheetRef.current?.close();
    signatureSheetRef.current?.close();
  };

  const settings = useMemo(
    () => [
      {
        title: `Edit username`,
        onPress: () => {
          closeSheets();
          setIsUpdateUsernameDialogOpen(true);
        },
      },
      {
        title: `Edit self-portrait`,
        onPress: () => {
          closeSheets();
          signatureSheetRef.current?.expand();
        },
      },
      {
        title: "Unblock users",
        onPress: () => {
          closeSheets();
          unblockSheetRef.current?.expand();
        },
      },
      {
        title: `Logout`,
        onPress: () => {
          closeSheets();
          logout();
        },
      },
      {
        title: "Delete your account",
        onPress: () => {
          closeSheets();
          setDeleteAccountDialogOpen(true);
        },
      },
    ],
    [logout]
  );

  return (
    <SafeAreaView style={styles.root}>
      <Calendar author={state.user?.username ?? ""} />
      <FlatList
        data={settings}
        renderItem={({ item, index }) => (
          <SettingsItem firstItem={index === 0} {...item} />
        )}
      />
      <EditUsernameDialog
        visible={isUpdateUsernameDialogOpen}
        setVisible={setIsUpdateUsernameDialogOpen}
        updateUsername={updateUsername}
        initialUsername={state.user?.username ?? ""}
      />
      <DeleteAccountDialog
        deleteAccount={deleteAccount}
        visible={deleteAccountDialogOpen}
        setVisible={setDeleteAccountDialogOpen}
      />
      <UpdateSignatureBottomSheet
        ref={signatureSheetRef}
        updateSignature={updateSignature}
        signature={state.user?.signature ?? ""}
        closeModal={closeSheets}
      />
      <UnblockUsersBottomSheet
        ref={unblockSheetRef}
        unblockUser={unblockUser}
        blockedUsers={state.blockedUsers}
        closeModal={closeSheets}
      />
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

const EditUsernameDialog = ({
  visible,
  setVisible,
  updateUsername,
  initialUsername,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  updateUsername: (newUsername: string) => void;
  initialUsername: string;
}) => {
  const [newUsername, setNewUsername] = useState(initialUsername);

  return (
    <Dialog.Container visible={visible}>
      <Dialog.Title>Update username</Dialog.Title>
      <Dialog.Input
        multiline={false}
        value={newUsername}
        onChangeText={setNewUsername}
      />
      <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
      <Dialog.Button
        onPress={() => {
          updateUsername(newUsername);
          setVisible(false);
        }}
        label="Update"
        bold
      />
    </Dialog.Container>
  );
};

const DeleteAccountDialog = ({
  visible,
  setVisible,
  deleteAccount,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  deleteAccount: (password: string) => void;
}) => {
  const [password, setPassword] = useState("");
  return (
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
  );
};

type UpdateSignatureBottomSheetProps = {
  updateSignature: (signature: string) => void;
  signature: string;
  closeModal: () => void;
};
const UpdateSignatureBottomSheet = forwardRef<
  BottomSheet,
  UpdateSignatureBottomSheetProps
>(function UpdateSignatureBottomSheet(
  { updateSignature, signature, closeModal },
  ref
) {
  const snapPoints = useMemo(() => ["65%"], []);
  const [strokes, setStrokes] = useState<Stroke[]>(
    convertSvgToStrokes(signature)
  );
  return (
    <BottomSheet
      ref={ref}
      snapPoints={snapPoints}
      bottomInset={46}
      detached={true}
      style={{
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 8,
        backgroundColor: "white",
        borderRadius: 15,
      }}
      enablePanDownToClose
      enableContentPanningGesture={false}
      index={-1}
    >
      <View style={{ alignItems: "center" }}>
        <Signature
          strokes={strokes}
          setStrokes={setStrokes}
          showGuide={false}
        />
      </View>
      <Button
        title="update"
        onPress={() => {
          updateSignature(
            convertStrokesToSvg(strokes, {
              width: SIGNATURE_WIDTH,
              height: SIGNATURE_HEIGHT,
            })
          );
          closeModal();
        }}
        style={{ marginTop: 5 }}
      />
    </BottomSheet>
  );
});

type UnblockUsersBottomSheetProps = {
  unblockUser: (userId: string) => void;
  blockedUsers?: BlockedUserType[];
  closeModal: () => void;
};
const UnblockUsersBottomSheet = forwardRef<
  BottomSheet,
  UnblockUsersBottomSheetProps
>(function UnblockUsersBottomSheet(
  { unblockUser, blockedUsers, closeModal },
  ref
) {
  const snapPoints = useMemo(() => ["50%", "60%"], []);

  return (
    <BottomSheet
      ref={ref}
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
        {blockedUsers && blockedUsers.length > 0 ? (
          <BottomSheetFlatList
            data={blockedUsers}
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
  );
});
