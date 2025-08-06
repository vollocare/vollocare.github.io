// 自定義 p5.js 型別定義，針對 Instance Mode

interface p5Vector {
  x: number;
  y: number;
  z?: number;
  add(x: number, y: number, z?: number): p5Vector;
  add(v: p5Vector): p5Vector;
  sub(x: number, y: number, z?: number): p5Vector;
  sub(v: p5Vector): p5Vector;
  mult(n: number): p5Vector;
  div(n: number): p5Vector;
  mag(): number;
  magSq(): number;
  normalize(): p5Vector;
  limit(max: number): p5Vector;
  heading(): number;
  rotate(angle: number): p5Vector;
  copy(): p5Vector;
  static sub(v1: p5Vector, v2: p5Vector): p5Vector;
  static add(v1: p5Vector, v2: p5Vector): p5Vector;
  static mult(v: p5Vector, n: number): p5Vector;
  static div(v: p5Vector, n: number): p5Vector;
  static dist(v1: p5Vector, v2: p5Vector): number;
}

interface p5Instance {
  // Core functions
  setup?: () => void;
  draw?: () => void;
  
  // Canvas
  createCanvas(w: number, h: number, renderer?: string): any;
  background(color: number): void;
  background(r: number, g: number, b: number): void;
  
  // Rendering
  fill(color: number): void;
  fill(color: string): void;
  fill(r: number, g: number, b: number, a?: number): void;
  stroke(color: number): void;
  stroke(color: string): void;
  stroke(r: number, g: number, b: number, a?: number): void;
  strokeWeight(weight: number): void;
  noStroke(): void;
  push(): void;
  pop(): void;
  translate(x: number, y: number, z?: number): void;
  rotate(angle: number): void;
  
  // Drawing
  line(x1: number, y1: number, x2: number, y2: number): void;
  circle(x: number, y: number, diameter: number): void;
  rect(x: number, y: number, w: number, h?: number): void;
  
  // Color
  color(r: number, g: number, b: number, a?: number): any;
  tint(r: number, g: number, b: number, a?: number): void;
  tint(color: number, alpha?: number): void;
  noTint(): void;
  
  // Text
  text(str: string, x: number, y: number, z?: number): void;
  textAlign(horizAlign: string, vertAlign?: string): void;
  
  // Shape
  beginShape(): void;
  endShape(mode?: string): void;
  vertex(x: number, y: number, z?: number): void;
  
  // Vector
  createVector(x?: number, y?: number, z?: number): p5Vector;
  
  // Constants
  WEBGL: string;
  CENTER: string;
  CLOSE: string;
  LEFT: string;
  TOP: string;
  
  // Math
  random(min?: number, max?: number): number;
  radians(degrees: number): number;
  degrees(radians: number): number;
  
  // Events
  mousePressed?: () => void;
  keyPressed?: () => void;
  keyReleased?: () => void;
  mouseX: number;
  mouseY: number;
  keyCode: number;
  
  // System functions
  frameRate(): number;
  textSize(size: number): void;
  noFill(): void;
}

// p5 constructor
declare const p5: {
  new (sketch: (p: p5Instance) => void): any;
  Vector: typeof p5Vector;
};