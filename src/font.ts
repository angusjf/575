import { loadAsync, useFonts } from "expo-font";

export const fonts = {
  PlexMonoBold: "IBMPlexMono-Bold",
  PlexMonoBoldItalic: "IBMPlexMono-BoldItalic",
  PlexMonoItalic: "IBMPlexMono-Italic",
  PlexSansBoldItalic: "IBMPlexSans-BoldItalic",
  PlexSerifBoldItalic: "IBMPlexSerif-BoldItalic",
  PlexSerifRegular: "IBMPlexSerif-Regular",
};

export const loadFonts = () =>
  loadAsync({
    [fonts.PlexMonoBold]: require("../assets/fonts/IBMPlexMono-Bold.ttf"),
    [fonts.PlexMonoBoldItalic]: require("../assets/fonts/IBMPlexMono-BoldItalic.ttf"),
    [fonts.PlexMonoItalic]: require("../assets/fonts/IBMPlexMono-Italic.ttf"),
    [fonts.PlexSansBoldItalic]: require("../assets/fonts/IBMPlexSans-BoldItalic.ttf"),
    [fonts.PlexSerifBoldItalic]: require("../assets/fonts/IBMPlexSerif-BoldItalic.ttf"),
    [fonts.PlexSerifRegular]: require("../assets/fonts/IBMPlexSerif-Regular.ttf"),
  });
