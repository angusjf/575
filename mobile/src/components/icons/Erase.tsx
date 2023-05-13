import * as React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export const Erase = ({ size }: { size: number }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Path
        d="M338.764 38.564l148.258 123.02a29.923 29.923 0 013.926 42.233L312.105 419.283c-17.32 15.893-96.448 23.228-117.54 2.99L91.97 335.896c-12.711-10.702-14.538-29.446-3.925-42.232l208.48-251.173c10.613-12.786 29.451-14.537 42.239-3.927z"
        opacity={1}
        fill="none"
        fillOpacity={1}
        stroke="#000"
        strokeWidth={24}
        strokeLinejoin="miter"
        strokeMiterlimit={4}
        strokeDasharray="none"
        strokeDashoffset={0}
        strokeOpacity={1}
      />
      <Path
        d="M.138 487.032v25.711zM344.975 42.45l135.377 115.039c12.646 10.746 14.396 29.763 3.922 42.637l-103.03 126.648-193.887-140.98L303.242 46.291c10.605-12.767 29.086-14.588 41.733-3.841z"
        opacity={1}
        fill="#000"
        fillOpacity={1}
        stroke="none"
        strokeWidth={16}
        strokeLinejoin="miter"
        strokeMiterlimit={4}
        strokeDasharray="none"
        strokeDashoffset={0}
        strokeOpacity={1}
      />
    </Svg>
  );
};
