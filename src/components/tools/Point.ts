export class Point {
  x: number;
  y: number;
  time: number;

  constructor(x: number, y: number, time: number) {
    this.x = x;
    this.y = y;
    this.time = time || new Date().getTime();
  }

  velocityFrom(start: Point) {
    return this.time !== start.time
      ? this.distanceTo(start) / (this.time - start.time)
      : 1;
  }

  distanceTo(start: Point) {
    return Math.sqrt(
      Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2)
    );
  }

  equals(point: Point) {
    return this.x === point.x && this.y === point.y && this.time === point.time;
  }
}
