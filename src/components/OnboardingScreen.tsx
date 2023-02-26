import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  SafeAreaView,
  View,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { fonts } from "../font";
import { useAppState } from "../useAppState";
import { Button } from "./Button";
import { HaikuLineInput } from "./HaikuLineInput";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f9f6f6",
  },
  slideContainer: {
    width: Dimensions.get("window").width,
    padding: 40,
    fontFamily: fonts.PlexMonoItalic,
    justifyContent: "center",
  },
  buttonContainer: {
    borderTopColor: "black",
    borderTopWidth: 0.5,
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
  },
  line: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 20,
    marginBottom: 15,
  },
  logo: {
    fontFamily: fonts.PlexSerifBoldItalic,
    fontSize: 70,
    marginTop: 50,
  },
  getStarted: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 21,
    marginBottom: 10,
  },
  scrollIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 50,
    marginBottom: 20,
  },
  scrollIndicatorBubble: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "black",
    borderColor: "black",
    borderWidth: 1,
  },
});

const ONBOARDING_SLIDES = [
  {
    id: "0",
    line1: "a haiku app ⁵",
    line2: " to help you write a poem ⁷",
    line3: "  every single day ⁵",
  },
  {
    id: "1",
    line1: "our state of the art ⁵",
    line2: " haiku validation tech ⁷",
    line3: "  counts your syllables ⁵",
  },
  {
    id: "2",
    line1: "contemplate your day ⁵",
    line2: " find your inner haiku poet ⁷",
    line3: "  your friends also join ⁵",
  },
];

export const OnboardingScreen = () => {
  const { finishOnboarding } = useAppState();

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      setCurrentIndex(viewableItems[0].index);
    }
  ).current;
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.logo}>575</Text> */}
      <FlatList
        snapToAlignment={"start"}
        snapToInterval={Dimensions.get("window").width}
        decelerationRate={"fast"}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            <Text style={styles.line}>{item.line1}</Text>
            <Text style={styles.line}>{item.line2}</Text>
            <Text style={styles.line}>{item.line3}</Text>
          </View>
        )}
      />
      <View style={styles.scrollIndicatorContainer}>
        <View
          style={{
            ...styles.scrollIndicatorBubble,
            backgroundColor: currentIndex === 0 ? "black" : "white",
          }}
        />
        <View
          style={{
            ...styles.scrollIndicatorBubble,
            backgroundColor: currentIndex === 1 ? "black" : "white",
          }}
        />
        <View
          style={{
            ...styles.scrollIndicatorBubble,
            backgroundColor: currentIndex === 2 ? "black" : "white",
          }}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Text style={styles.getStarted}>Get Started</Text>
        <HaikuLineInput
          placeholder="how do you sign your work"
          long
          validity="unchecked"
          onPressIn={finishOnboarding}
        />
      </View>
    </SafeAreaView>
  );
};
