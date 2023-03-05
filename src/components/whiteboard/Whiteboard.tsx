import React, { CSSProperties, useRef, useState } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import Svg, { G, Path } from "react-native-svg";
import { Pen } from "./Pen";
import { Point } from "./Point";
import { Stroke } from "./Stroke";

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
      currentPoints.push({ x: p.x + distance, y: p.y + distance });
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
    setCurrentPoints([
      ...currentPoints,
      { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY },
    ]);
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
              <Path
                {...stroke.attributes}
                key={JSON.stringify(stroke.attributes)}
              />
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
