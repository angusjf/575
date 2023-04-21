import { loadAsync } from "expo-font";

export const fonts = {
  PlexMonoBold: "IBMPlexMono-Bold",
  PlexMonoItalic: "IBMPlexMono-Italic",
  PlexSansBoldItalic: "IBMPlexSans-BoldItalic",
};

export const loadFonts = () =>
  loadAsync({
    [fonts.PlexMonoBold]: require("../assets/fonts/IBMPlexMono-Bold.ttf"),
    [fonts.PlexMonoItalic]: require("../assets/fonts/IBMPlexMono-Italic.ttf"),
    [fonts.PlexSansBoldItalic]: require("../assets/fonts/IBMPlexSans-BoldItalic.ttf"),
  });
