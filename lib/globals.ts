import { AudioSystem } from "./AudioSystem";
import { Glottis } from "./Glottis";
import { Tract } from "./Tract";
import { TractUI } from "./TractUI";
import { UI } from "./UI";

export let sampleRate: number;

export let time = 0;
export const temp = { a: 0, b: 0 };
export let alwaysVoice = false;
export let autoWobble = false;
export let noiseFreq = 500;
export let noiseQ = 0.7;
export let palePink = "#FFEEF5";
export let isFirefox = false;

export let ui: UI;
export let audioSystem: AudioSystem;
export let glottis: Glottis;
export let tract: Tract;
export let tractUI: TractUI;

export let backCanvas: HTMLCanvasElement;
export let backCtx: CanvasRenderingContext2D;
export let tractCanvas: HTMLCanvasElement;
export let tractCtx: CanvasRenderingContext2D;

export const CANVAS_SCALE = 2; // Early Pink Trombone is hard-coded to low res

// Export setters for the global variables
export function setSampleRate(value: number) {
  sampleRate = value;
}

export function setTime(value: number) {
  time = value;
}

export function setTempA(value: number) {
  temp.a = value;
}

export function setTempB(value: number) {
  temp.b = value;
}

export function setAlwaysVoice(value: boolean) {
  alwaysVoice = value;
}

export function setAutoWobble(value: boolean) {
  autoWobble = value;
}

export function setNoiseFreq(value: number) {
  noiseFreq = value;
}

export function setNoiseQ(value: number) {
  noiseQ = value;
}

export function setPalePink(value: string) {
  palePink = value;
}

export function setIsFirefox(value: boolean) {
  isFirefox = value;
}

export function setUI(value: UI) {
  ui = value;
}

export function setAudioSystem(value: AudioSystem) {
  audioSystem = value;
}

export function setGlottis(value: Glottis) {
  glottis = value;
}

export function setTract(value: Tract) {
  tract = value;
}

export function setTractUI(value: TractUI) {
  tractUI = value;
}

export function setBackCanvas(value: HTMLCanvasElement) {
  backCanvas = value;
}

export function setBackCtx(value: CanvasRenderingContext2D) {
  backCtx = value;
}

export function setTractCanvas(value: HTMLCanvasElement) {
  tractCanvas = value;
}

export function setTractCtx(value: CanvasRenderingContext2D) {
  tractCtx = value;
}
