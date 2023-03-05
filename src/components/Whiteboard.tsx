import React, { useState } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";
import humps from "humps";

type WhiteboardProps = {
  strokeWidth: number;
  color: string;
  containerStyle: StyleProp<ViewStyle>;
};

export type Point = {
  x: number;
  y: number;
};

export type Stroke = {
  attributes: Record<string, string | number>;
  type: string;
};

export const convertStrokesToSvg = (
  strokes: Stroke[],
  layout: { width: number; height: number }
): string => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${
    layout.height
  }" version="1.1">
      <g>
        ${strokes
          .map((e) => {
            return `<${e.type.toLowerCase()} ${Object.keys(e.attributes)
              .map((a) => {
                return `${humps.decamelize(a, { separator: "-" })}="${
                  e.attributes[a]
                }"`;
              })
              .join(" ")}/>`;
          })
          .join("\n")}
      </g>
    </svg>
  `;
};

const pointsToSvg = (points: Point[]) => {
  if (points.length > 0) {
    var path = `M ${points[0].x},${points[0].y}`;
    points.forEach((point) => {
      path = path + ` L ${point.x},${point.y}`;
    });
    return path;
  } else {
    return "";
  }
};

export const Whiteboard = ({
  strokeWidth,
  color,
  containerStyle,
}: WhiteboardProps) => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [previousStrokes, setPreviousStrokes] = useState<Stroke[]>([]);

  const onResponderRelease = () => {
    if (currentPoints.length < 1) return;

    if (currentPoints.length === 1) {
      let p = currentPoints[0];
      let distance = Math.sqrt(strokeWidth || 4) / 2;
      currentPoints.push({ x: p.x + distance, y: p.y + distance });
    }

    let newElement: Stroke = {
      type: "Path",
      attributes: {
        d: pointsToSvg(currentPoints),
        stroke: color || "#000000",
        strokeWidth: strokeWidth || 4,
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    };

    setPreviousStrokes((oldPrevStrokes) => [...oldPrevStrokes, newElement]);
    setCurrentPoints([]);
  };

  const onTouch = (evt: GestureResponderEvent) => {
    setCurrentPoints([
      ...currentPoints,
      { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY },
    ]);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (_) => true,
    onMoveShouldSetPanResponder: (_) => true,
    onPanResponderGrant: onTouch,
    onPanResponderMove: onTouch,
    onPanResponderRelease: () => onResponderRelease(),
  });

  return (
    <View style={containerStyle}>
      <View style={styles.svgContainer} {...panResponder.panHandlers}>
        <Svg style={styles.drawSurface}>
          <G>
            {previousStrokes.map((stroke) => (
              <Path
                {...stroke.attributes}
                key={JSON.stringify(stroke.attributes)}
              />
            ))}
            <Path
              d={pointsToSvg(currentPoints)}
              stroke={color || "#000000"}
              strokeWidth={strokeWidth || 4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </G>
        </Svg>
      </View>
    </View>
  );
};

let styles = StyleSheet.create({
  svgContainer: {
    flex: 1,
  },
  drawSurface: {
    flex: 1,
  },
});
