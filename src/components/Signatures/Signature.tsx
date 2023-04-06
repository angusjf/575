import BottomSheet from "@gorhom/bottom-sheet";
import { useMemo, useRef } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { fonts } from "../../font";
import { SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from "../../utils/consts";
import { Erase } from "../icons/Erase";
import { QuestionMark } from "../icons/QuestionMark";
import { Stroke, Whiteboard } from "./Whiteboard";

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 15,
  },
  guideTitle: {
    fontFamily: fonts.PlexMonoBold,
    fontSize: 20,
  },
  guideContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  guideLine: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 16,
    marginTop: 10,
    lineHeight: 28,
  },
});

export const Signature = ({
  strokes,
  setStrokes,
  showGuide = true,
}: {
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
  showGuide?: boolean;
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%"], []);

  return (
    <View style={{ marginVertical: 20, paddingTop: 20 }}>
      {showGuide && (
        <TouchableOpacity
          style={{
            position: "absolute",
            right: 5,
            top: 5,
            zIndex: 2,
          }}
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <QuestionMark size={25} />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={{
          position: "absolute",
          left: 5,
          top: 5,
          zIndex: 2,
        }}
        onPress={() => setStrokes([])}
      >
        <Erase size={25} />
      </TouchableOpacity>
      <View
        style={{
          backgroundColor: "rgb(245, 242, 242)",
          height: SIGNATURE_HEIGHT,
          width: SIGNATURE_WIDTH,
          borderRadius: SIGNATURE_HEIGHT / 2,
          overflow: "hidden",
        }}
      >
        <Whiteboard
          strokes={strokes}
          setStrokes={setStrokes}
          color={"#2c2a2a"}
          strokeWidth={4}
        />
      </View>
      {showGuide && (
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          style={{
            shadowColor: "#000",
            backgroundColor: "white",
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
            <Text style={styles.guideTitle}>Sign your Haikus</Text>
            <View style={styles.guideContainer}>
              <Text style={styles.guideLine}>Hand-drawn self-portrait,</Text>
              <Text style={styles.guideLine}>
                Displayed with your haiku verse,
              </Text>
              <Text style={styles.guideLine}>Unique and creative.</Text>
            </View>
          </View>
        </BottomSheet>
      )}
    </View>
  );
};
