import { Point } from "./Point";
import { Stroke } from "./Stroke";

export class Pen {
  strokes: Stroke[];
  _offsetX: number;
  _offsetY: number;

  constructor(strokes?: Stroke[]) {
    this.strokes = strokes || [];
    this._offsetX = 0;
    this._offsetY = 0;
  }

  addStroke(points: Point[]) {
    if (points.length > 0) {
      this.strokes.push(points);
    }
  }

  rewindStroke() {
    if (this.strokes.length < 1) return;
    this.strokes.pop();
  }

  setOffset(options: Point) {
    if (!options) return;
    this._offsetX = options.x;
    this._offsetY = options.y;
  }

  pointsToSvg(points: Point[]) {
    let offsetX = this._offsetX;
    let offsetY = this._offsetY;
    if (points.length > 0) {
      var path = `M ${points[0].x},${points[0].y}`;
      points.forEach((point) => {
        path = path + ` L ${point.x},${point.y}`;
      });
      return path;
    } else {
      return "";
    }
  }

  clear = () => {
    this.strokes = [];
  };
}
