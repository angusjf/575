import React from "react";
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

export class Whiteboard extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      currentPoints: [],
      previousStrokes: this.props.strokes || [],
      newStroke: [],
      pen: new Pen(),
    };

    const onResponderRelease = () => {
      let strokes = this.state.previousStrokes;
      if (this.state.currentPoints.length < 1) return;

      let points = this.state.currentPoints;
      if (points.length === 1) {
        let p = points[0];
        let distance = parseInt(Math.sqrt(this.props.strokeWidth || 4) / 2);
        points.push(new Point(p.x + distance, p.y + distance, p.time));
      }

      let newElement = {
        type: "Path",
        attributes: {
          d: this.state.pen.pointsToSvg(points),
          stroke: this.props.color || "#000000",
          strokeWidth: this.props.strokeWidth || 4,
          fill: "none",
          strokeLinecap: "round",
          strokeLinejoin: "round",
        },
      };

      this.state.pen.addStroke(points);

      this.setState({
        previousStrokes: [...this.state.previousStrokes, newElement],
        currentPoints: [],
      });
    };
    const onTouch = (evt: GestureResponderEvent) => {
      let x, y, timestamp;
      [x, y, timestamp] = [
        evt.nativeEvent.locationX,
        evt.nativeEvent.locationY,
        evt.nativeEvent.timestamp,
      ];
      let newPoint = new Point(x, y, timestamp);
      let newCurrentPoints = this.state.currentPoints;
      newCurrentPoints.push(newPoint);

      this.setState({
        previousStrokes: this.state.previousStrokes,
        currentPoints: newCurrentPoints,
      });
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt) => onTouch(evt),
      onPanResponderMove: (evt) => onTouch(evt),
      onPanResponderRelease: (evt, gs) => onResponderRelease(evt, gs),
    });
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.strokes &&
      newProps.strokes &&
      JSON.stringify(this.props.strokes) !== JSON.stringify(newProps.strokes)
    ) {
      this.setState({
        previousStrokes: newProps.strokes,
        newStroke: [],
      });
    }
  }

  render() {
    return (
      <View
        onLayout={(e) => {
          this.state.pen.setOffset(e.nativeEvent.layout);
          this._layout = e.nativeEvent.layout;
        }}
        style={[styles.drawContainer, this.props.containerStyle]}
      >
        <View style={styles.svgContainer} {...this._panResponder.panHandlers}>
          <Svg style={styles.drawSurface}>
            <G>
              {this.state.previousStrokes.map((stroke) => (
                <Path {...stroke.attributes} />
              ))}
              <Path
                key={this.state.previousStrokes.length}
                d={this.state.pen.pointsToSvg(this.state.currentPoints)}
                stroke={this.props.color || "#000000"}
                strokeWidth={this.props.strokeWidth || 4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </G>
          </Svg>
        </View>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  drawContainer: {},
  svgContainer: {
    flex: 1,
  },
  drawSurface: {
    flex: 1,
  },
});
