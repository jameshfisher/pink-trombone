type TouchT = {
  startTime: number;
  endTime: number;
  fricative_intensity: number;
  alive: boolean;
  id: string | number;
  x: number;
  y: number;
  index: number;
  diameter: number;
};

type Transient = {
  strength: number;
  exponent: number;
  timeAlive: number;
  position: number;
  lifeTime: number;
};

type ButtonT = {
  x: null;
  y: null;
  width: null;
  height: null;
  text: null;
  switchedOn: boolean;
  draw: (ctx: unknown) => void;
  drawText: (ctx: unknown) => void;
  handleTouchStart: (touch: unknown) => void;
};
