import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  color,
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { fonts } from "../font";
import { getSeason } from "../seasons";
import { Haiku, PastHaiku } from "../types";
import { parseDateDbKey } from "../utils/date";
import { HaikuLine } from "./HaikuLine";

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginVertical: 25,
  },
  dayCard: {
    marginHorizontal: 5,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "white",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
  },
  season: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 10,
    marginBottom: 2,
  },
  date: {
    fontFamily: fonts.PlexSansBoldItalic,
    fontSize: 20,
    marginBottom: 2,
  },
  month: {
    fontFamily: fonts.PlexMonoItalic,
    fontSize: 10,
  },
  selectedDay: {
    backgroundColor: "black",
  },
  selectedDayHaikuContainer: {
    overflow: "hidden",
    paddingTop: 10,
  },
  author: {
    textAlign: "right",
    fontFamily: fonts.PlexSansBoldItalic,
  },
});

const DayCard = ({ date, didPost, onSelect, isSelected }: any) => (
  <TouchableOpacity
    style={[
      styles.dayCard,
      {
        opacity: didPost ? 1 : 0.5,
        backgroundColor: isSelected ? "black" : "white",
      },
    ]}
    disabled={!didPost}
    onPress={onSelect}
  >
    <Text style={[styles.season, { color: isSelected ? "white" : "black" }]}>
      {getSeason(date)}
    </Text>
    <Text style={[styles.date, { color: isSelected ? "white" : "black" }]}>
      {date.getDate()}
    </Text>
    <Text style={[styles.month, { color: isSelected ? "white" : "black" }]}>
      {date.toLocaleString("default", { month: "short" })}
    </Text>
  </TouchableOpacity>
);

export const Calendar = ({ pastHaikus }: { pastHaikus: PastHaiku[] }) => {
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const openAnim = useSharedValue(open ? 1 : 0);

  const selected = useAnimatedStyle(() => {
    return {
      height: interpolate(
        openAnim.value,
        [0, 1],
        [0, 2 * 50],
        Extrapolate.CLAMP
      ),
    };
  });

  useEffect(() => {
    openAnim.value = withSpring(open ? 1 : 0);
  }, [open, openAnim]);

  const days = useMemo(
    () =>
      Object.entries(pastHaikus)
        .map(([dayKey, value]) => {
          const date = parseDateDbKey(dayKey);
          const didPost = true;
          return {
            date,
            didPost,
            haiku: Object.values(value.haiku) as Haiku,
            username: value.username,
          };
        })
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [pastHaikus]
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        data={days}
        renderItem={({ item, index }) => (
          <DayCard
            {...item}
            isSelected={selectedDay === index}
            onSelect={() => {
              if (selectedDay === index) {
                setOpen(!open);
                setTimeout(() => {
                  setSelectedDay(undefined);
                }, 90);
                return;
              }
              setOpen(true);
              setSelectedDay(index);
            }}
          />
        )}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{ padding: 10 }}
        inverted={true}
      />
      <Animated.View style={[selected, styles.selectedDayHaikuContainer]}>
        {selectedDay !== undefined && (open || openAnim.value > 0) ? (
          <>
            <HaikuLine text={days[selectedDay].haiku[0]} size="small" />
            <HaikuLine text={days[selectedDay].haiku[1]} size="small" />
            <HaikuLine text={days[selectedDay].haiku[2]} size="small" />
            <Text style={styles.author}>~ {days[selectedDay].username}</Text>
          </>
        ) : (
          <></>
        )}
      </Animated.View>
    </View>
  );
};
