import React, { CSSProperties, useRef, useState } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { Pen } from "./tools/Pen";
import { Point } from "./tools/Point";
import humps from "humps";
import { Stroke } from "./tools/Stroke";

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

type WhiteboardProps = {
  strokeWidth: number;
  color: string;
  containerStyle: CSSProperties;
};

export const Whiteboard = ({
  strokeWidth,
  color,
  containerStyle,
}: WhiteboardProps) => {
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [previousStrokes, setPreviousStrokes] = useState<Stroke[]>([]);
  const pen = useRef(new Pen());

  const onResponderRelease = () => {
    if (currentPoints.length < 1) return;

    if (currentPoints.length === 1) {
      let p = currentPoints[0];
      let distance = Math.sqrt(strokeWidth || 4) / 2;
      currentPoints.push(new Point(p.x + distance, p.y + distance, p.time));
    }

    let newElement: Stroke = {
      type: "Path",
      attributes: {
        d: pen.current.pointsToSvg(currentPoints),
        stroke: color || "#000000",
        strokeWidth: strokeWidth || 4,
        fill: "none",
        strokeLinecap: "round",
        strokeLinejoin: "round",
      },
    };

    pen.current.addStroke(currentPoints);

    setPreviousStrokes((oldPrevStrokes) => [...oldPrevStrokes, newElement]);
    setCurrentPoints([]);
  };

  const onTouch = (evt: GestureResponderEvent) => {
    const [x, y, timestamp] = [
      evt.nativeEvent.locationX,
      evt.nativeEvent.locationY,
      evt.nativeEvent.timestamp,
    ];

    const newPoint = new Point(x, y, timestamp);

    setCurrentPoints([...currentPoints, newPoint]);
  };

  const _panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (_) => true,
    onMoveShouldSetPanResponder: (_) => true,
    onPanResponderGrant: onTouch,
    onPanResponderMove: onTouch,
    onPanResponderRelease: () => onResponderRelease(),
  });

  return (
    <View
      onLayout={(e) => {
        pen.current.setOffset(e.nativeEvent.layout);
      }}
      style={[styles.drawContainer, containerStyle]}
    >
      <View style={styles.svgContainer} {..._panResponder.panHandlers}>
        <Svg style={styles.drawSurface}>
          <G>
            {previousStrokes.map((stroke) => (
              <Path {...stroke.attributes} />
            ))}
            <Path
              d={pen.current.pointsToSvg(currentPoints)}
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
  drawContainer: {},
  svgContainer: {
    flex: 1,
  },
  drawSurface: {
    flex: 1,
  },
});
