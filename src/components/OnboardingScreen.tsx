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
import { FiveSevenFive } from "./FiveSevenFive";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  slideContainer: {
    width: Dimensions.get("window").width,
    paddingHorizontal: 40,
    paddingBottom: 70,
    fontFamily: fonts.PlexMonoItalic,
    justifyContent: "center",
  },
  buttonContainer: {
    borderTopColor: "grey",
    borderTopWidth: 0,
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
  },
  line: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 20,
    marginBottom: 15,
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
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "black",
    borderColor: "black",
    borderWidth: 1,
  },
});

const ONBOARDING_SLIDES = [
  {
    id: "0",
    line1: "a haiku app⁵",
    line2: "to help you write a poem⁷",
    line3: "every single day⁵",
  },
  {
    id: "1",
    line1: "our state of the art⁵",
    line2: "haiku validation tech⁷",
    line3: "counts your syllables⁵",
  },
  {
    id: "2",
    line1: "contemplate your day⁵",
    line2: "find your inner haiku poet⁷",
    line3: "your friends also join⁵",
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
      <FiveSevenFive fontSize={57} marginTop={50} />
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
      <Button
        onPress={finishOnboarding}
        title="Get Started"
        style={{
          marginBottom: 17,
        }}
      />
    </SafeAreaView>
  );
};
