import { loadAsync, useFonts } from "expo-font";

export const fonts = {
  PlexSerifRegular: "PlexSerifRegular",
  PlexSerifBoldItalic: "PlexSerifBoldItalic",
  PlexMonoItalic: "IBMPlexMono-Italic",
  PlexMonoBold: "IBMPlexMono-Bold",
};

export const loadFonts = () =>
  loadAsync({
    [fonts.PlexSerifRegular]: require("../assets/fonts/IBMPlexSerif-Regular.ttf"),
    [fonts.PlexSerifBoldItalic]: require("../assets/fonts/IBMPlexSerif-BoldItalic.ttf"),
    [fonts.PlexMonoItalic]: require("../assets/fonts/IBMPlexMono-Italic.ttf"),
    [fonts.PlexMonoBold]: require("../assets/fonts/IBMPlexMono-Bold.ttf"),
  });
