interface Math {
  clamp(number: number, min: number, max: number): number;
  moveTowards(
    current: number,
    target: number,
    amountUp: number,
    amountDown: number
  ): number;
  gaussian(): number;
}

// declare var IMAGINARY: {
//   i18n: {
//     getLang(): unknown;
//     t: (text: string) => string;
//     init: (args: {
//       queryStringVariable: string;
//       translationsDirectory: string;
//       defaultLanguage: string;
//     }) => Promise<unknown>;
//   };
// };

type TouchT = {
  startTime: number;
  endTime: number;
  fricative_intensity: number;
  alive: boolean;
  id: unknown;
  x: number;
  y: number;
  index: number;
  diameter: number;
};

type Transient = {
  strength: number;
  exponent: any;
  timeAlive: number;
  position: number;
  lifeTime: any;
};

type ButtonT = {
  x: null;
  y: null;
  width: null;
  height: null;
  text: null;
  switchedOn: boolean;
  draw: (ctx: any) => void;
  drawText: (ctx: any) => void;
  handleTouchStart: (touch: any) => void;
};
