import React, { useRef, useState } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { decamelize } from "humps";

export type Point = {
  x: number;
  y: number;
};

const pointsToSvg = (points: Point[]) => {
  if (points.length > 0) {
    return (
      `M ${points[0].x},${points[0].y}` +
      points.slice(1).map((point) => ` L ${point.x},${point.y}`)
    );
  } else {
    return "";
  }
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
          .map(
            (stroke) =>
              `<${stroke.type.toLowerCase()} ${Object.keys(stroke.attributes)
                .map(
                  (a) =>
                    `${decamelize(a, { separator: "-" })}="${
                      stroke.attributes[a]
                    }"`
                )
                .join(" ")}/>`
          )
          .join("\n")}
      </g>
    </svg>
  `;
};

type WhiteboardProps = {
  strokeWidth?: number;
  color?: string;
  strokes: Stroke[];
  setStrokes: React.Dispatch<React.SetStateAction<Stroke[]>>;
};

export const Whiteboard = ({
  strokeWidth = 4,
  color = "#000000",
  strokes: previousStrokes,
  setStrokes: setPreviousStrokes,
}: WhiteboardProps) => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  const onResponderRelease = () => {
    if (currentPoints.length < 1) return;

    if (currentPoints.length === 1) {
      let p = currentPoints[0];
      let distance = Math.sqrt(strokeWidth) / 2;
      currentPoints.push({ x: p.x + distance, y: p.y + distance });
    }

    let newElement: Stroke = {
      type: "Path",
      attributes: {
        d: pointsToSvg(currentPoints),
        stroke: color,
        strokeWidth: strokeWidth,
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_) => true,
      onMoveShouldSetPanResponder: (_) => true,
      onPanResponderGrant: onTouch,
      onPanResponderMove: onTouch,
      onPanResponderRelease: () => onResponderRelease(),
    })
  );

  return (
    <View style={styles.svgContainer} {...panResponder.current.panHandlers}>
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
            stroke={color}
            strokeWidth={strokeWidth || 4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
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
