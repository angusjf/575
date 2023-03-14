import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Heart } from "./icons/Heart";
import { HeartOutline } from "./icons/HeartOutline";
import * as Haptics from "expo-haptics";

export const LikeButton = ({
  disabled,
  isLiked,
  toggleLike,
}: {
  disabled: boolean;
  isLiked: boolean;
  toggleLike: () => void;
}) => {
  const liked = useSharedValue(isLiked ? 1 : 0);
  console.log(liked.value);

  const outlineStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
        },
      ],
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
    };
  });

  const onLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    liked.value = withSpring(liked.value ? 0 : 1);
    toggleLike();
  };

  return (
    <Pressable onPress={onLike} disabled={disabled}>
      <Animated.View style={[StyleSheet.absoluteFillObject, outlineStyle]}>
        <HeartOutline size={20} />
      </Animated.View>

      <Animated.View style={fillStyle}>
        <Heart size={20} />
      </Animated.View>
    </Pressable>
  );
};
