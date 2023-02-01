import { useFonts } from "expo-font";

export const fonts = {
  PlexSerifRegular: "PlexSerifRegular",
  PlexSerifBoldItalic: "PlexSerifBoldItalic",
  PlexMonoItalic: "IBMPlexMono-Italic",
};

export const useLoadFonts = () => {
  const [fontsLoaded] = useFonts({
    [fonts.PlexSerifRegular]: require("../assets/fonts/IBMPlexSerif-Regular.ttf"),
    [fonts.PlexSerifBoldItalic]: require("../assets/fonts/IBMPlexSerif-BoldItalic.ttf"),
    [fonts.PlexMonoItalic]: require("../assets/fonts/IBMPlexMono-Italic.ttf"),
  });

  return fontsLoaded;
};
