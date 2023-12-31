import * as IMAGINARY from "./i18n";
import * as noise from "./noise";
import {
  palePink,
  sampleRate,
  autoWobble,
  alwaysVoice,
  audioSystem,
  glottis,
  ui,
  backCtx,
  CANVAS_SCALE,
} from "./globals";
import { clamp } from "./math";

const VIBRATO_AMOUNT = 0.005;
const VIBRATO_FREQUENCY = 6;
const KEYBOARD_TOP = 500;
const KEYBOARD_LEFT = 0;
const KEYBOARD_WIDTH = 600;
const KEYBOARD_HEIGHT = 100;
const SEMITONES = 20;
const MARKS = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0];
const BASE_NOTE = 87.3071; // F

function drawBar(topFactor: number, bottomFactor: number, radius: number) {
  backCtx.lineWidth = CANVAS_SCALE * radius * 2;
  backCtx.beginPath();
  backCtx.moveTo(
    CANVAS_SCALE * (KEYBOARD_LEFT + radius),
    CANVAS_SCALE * (KEYBOARD_TOP + topFactor * KEYBOARD_HEIGHT + radius)
  );
  backCtx.lineTo(
    CANVAS_SCALE * (KEYBOARD_LEFT + KEYBOARD_WIDTH - radius),
    CANVAS_SCALE * (KEYBOARD_TOP + topFactor * KEYBOARD_HEIGHT + radius)
  );
  backCtx.lineTo(
    CANVAS_SCALE * (KEYBOARD_LEFT + KEYBOARD_WIDTH - radius),
    CANVAS_SCALE * (KEYBOARD_TOP + bottomFactor * KEYBOARD_HEIGHT - radius)
  );
  backCtx.lineTo(
    CANVAS_SCALE * (KEYBOARD_LEFT + radius),
    CANVAS_SCALE * (KEYBOARD_TOP + bottomFactor * KEYBOARD_HEIGHT - radius)
  );
  backCtx.closePath();
  backCtx.stroke();
  backCtx.fill();
}

export class Glottis {
  timeInWaveform: number;
  oldFrequency: number;
  newFrequency: number;
  UIFrequency: number;
  smoothFrequency: number;
  oldTenseness: number;
  newTenseness: number;
  UITenseness: number;
  totalTime: number;
  intensity: number;
  loudness: number;
  isTouched: boolean;
  isTouchingSomewhere: boolean;
  readonly ctx: CanvasRenderingContext2D;
  touch: TouchT | null;
  x: number;
  y: number;
  waveformLength: number;
  frequency: number;
  Rd: number;
  alpha: number;
  E0: number;
  epsilon: number;
  shift: number;
  Delta: number;
  Te: number;
  omega: number;

  constructor() {
    this.timeInWaveform = 0;
    this.oldFrequency = 140;
    this.newFrequency = 140;
    this.UIFrequency = 140;
    this.smoothFrequency = 140;
    this.oldTenseness = 0.6;
    this.newTenseness = 0.6;
    this.UITenseness = 0.6;
    this.totalTime = 0;
    this.intensity = 0;
    this.loudness = 1;
    this.isTouched = false;
    this.isTouchingSomewhere = false;
    this.ctx = backCtx;
    this.touch = null;
    this.x = 240;
    this.y = 530;
    this.waveformLength = 0; // ?
    this.frequency = 0;
    this.Rd = 0;
    this.alpha = 0;
    this.E0 = 0;
    this.epsilon = 0;
    this.shift = 0;
    this.Delta = 0;
    this.Te = 0;
    this.omega = 0;

    this.setupWaveform(0);
    this.drawKeyboard();
  }

  drawKeyboard() {
    this.ctx.strokeStyle = palePink;
    this.ctx.fillStyle = palePink;
    backCtx.globalAlpha = 1.0;
    backCtx.lineCap = "round";
    backCtx.lineJoin = "round";

    drawBar(0.0, 0.4, 8);
    backCtx.globalAlpha = 0.7;
    drawBar(0.52, 0.72, 8);

    backCtx.strokeStyle = "orchid";
    backCtx.fillStyle = "orchid";
    for (let i = 0; i < SEMITONES; i++) {
      const keyWidth = KEYBOARD_WIDTH / SEMITONES;
      const x = KEYBOARD_LEFT + (i + 1 / 2) * keyWidth;
      const y = KEYBOARD_TOP;
      if (MARKS[(i + 3) % 12] == 1) {
        backCtx.lineWidth = CANVAS_SCALE * 4;
        backCtx.globalAlpha = 0.4;
      } else {
        backCtx.lineWidth = CANVAS_SCALE * 3;
        backCtx.globalAlpha = 0.2;
      }
      backCtx.beginPath();
      backCtx.moveTo(CANVAS_SCALE * x, CANVAS_SCALE * (y + 9));
      backCtx.lineTo(
        CANVAS_SCALE * x,
        CANVAS_SCALE * (y + KEYBOARD_HEIGHT * 0.4 - 9)
      );
      backCtx.stroke();

      backCtx.lineWidth = CANVAS_SCALE * 3;
      backCtx.globalAlpha = 0.15;

      backCtx.beginPath();
      backCtx.moveTo(
        CANVAS_SCALE * x,
        CANVAS_SCALE * (y + KEYBOARD_HEIGHT * 0.52 + 6)
      );
      backCtx.lineTo(
        CANVAS_SCALE * x,
        CANVAS_SCALE * (y + KEYBOARD_HEIGHT * 0.72 - 6)
      );
      backCtx.stroke();
    }

    backCtx.fillStyle = "orchid";
    backCtx.font = "bold 28px Quicksand";
    backCtx.textAlign = "center";
    backCtx.globalAlpha = 0.7;
    backCtx.fillText(
      IMAGINARY.i18n.t("VOICEBOX_CONTROL"),
      CANVAS_SCALE * 300,
      CANVAS_SCALE * 490
    );
    backCtx.fillText(
      IMAGINARY.i18n.t("PITCH"),
      CANVAS_SCALE * 300,
      CANVAS_SCALE * 592
    );
    backCtx.globalAlpha = 0.3;
    backCtx.strokeStyle = "orchid";
    backCtx.fillStyle = "orchid";
    backCtx.save();
    backCtx.translate(CANVAS_SCALE * 430, CANVAS_SCALE * 587);
    this.drawArrow(80, 2, 10);
    backCtx.translate(CANVAS_SCALE * -260, CANVAS_SCALE * 0);
    backCtx.rotate(Math.PI);
    this.drawArrow(80, 2, 10);
    backCtx.restore();
    backCtx.globalAlpha = 1.0;
  }

  drawArrow(l: number, ahw: number, ahl: number) {
    backCtx.lineWidth = CANVAS_SCALE * 2;
    backCtx.beginPath();
    backCtx.moveTo(CANVAS_SCALE * -l, CANVAS_SCALE * 0);
    backCtx.lineTo(CANVAS_SCALE * 0, CANVAS_SCALE * 0);
    backCtx.lineTo(CANVAS_SCALE * 0, CANVAS_SCALE * -ahw);
    backCtx.lineTo(CANVAS_SCALE * ahl, CANVAS_SCALE * 0);
    backCtx.lineTo(CANVAS_SCALE * 0, CANVAS_SCALE * ahw);
    backCtx.lineTo(CANVAS_SCALE * 0, CANVAS_SCALE * 0);
    backCtx.closePath();
    backCtx.stroke();
    backCtx.fill();
  }

  handleTouches() {
    this.isTouchingSomewhere = false;
    if (this.touch != null && !this.touch.alive) {
      this.touch = null;
    }

    if (this.touch == null) {
      for (let j = 0; j < ui.touchesWithMouse.length; j++) {
        const touch = ui.touchesWithMouse[j];
        if (!touch.alive) continue;
        this.isTouchingSomewhere = true;
        if (touch.y < KEYBOARD_TOP) continue;
        this.touch = touch;
      }
    }

    if (this.touch != null) {
      this.isTouchingSomewhere = true;
      let local_y = this.touch.y - KEYBOARD_TOP - 10;
      const local_x = this.touch.x - KEYBOARD_LEFT;
      local_y = clamp(local_y, 0, KEYBOARD_HEIGHT - 26);
      const semitone = (SEMITONES * local_x) / KEYBOARD_WIDTH + 0.5;
      glottis.UIFrequency = BASE_NOTE * Math.pow(2, semitone / 12);
      if (glottis.intensity == 0) glottis.smoothFrequency = glottis.UIFrequency;
      //Glottis.UIRd = 3*local_y / (this.keyboardHeight-20);
      const t = clamp(1 - local_y / (KEYBOARD_HEIGHT - 28), 0, 1);
      glottis.UITenseness = 1 - Math.cos(t * Math.PI * 0.5);
      glottis.loudness = Math.pow(glottis.UITenseness, 0.25);
      this.x = this.touch.x;
      this.y = local_y + KEYBOARD_TOP + 10;
    }
    glottis.isTouched = this.touch != null;
  }

  runStep(lambda: number, noiseSource: number) {
    const timeStep = 1.0 / sampleRate;
    this.timeInWaveform += timeStep;
    this.totalTime += timeStep;
    if (this.timeInWaveform > this.waveformLength) {
      this.timeInWaveform -= this.waveformLength;
      this.setupWaveform(lambda);
    }
    let out = this.normalizedLFWaveform(
      this.timeInWaveform / this.waveformLength
    );
    let aspiration =
      this.intensity *
      (1 - Math.sqrt(this.UITenseness)) *
      this.getNoiseModulator() *
      noiseSource;
    aspiration *= 0.2 + 0.02 * noise.simplex1(this.totalTime * 1.99);
    out += aspiration;
    return out;
  }

  getNoiseModulator() {
    const voiced =
      0.1 +
      0.2 *
        Math.max(
          0,
          Math.sin((Math.PI * 2 * this.timeInWaveform) / this.waveformLength)
        );
    //return 0.3;
    return (
      this.UITenseness * this.intensity * voiced +
      (1 - this.UITenseness * this.intensity) * 0.3
    );
  }

  finishBlock() {
    let vibrato = 0;
    vibrato +=
      VIBRATO_AMOUNT *
      Math.sin(2 * Math.PI * this.totalTime * VIBRATO_FREQUENCY);
    vibrato += 0.02 * noise.simplex1(this.totalTime * 4.07);
    vibrato += 0.04 * noise.simplex1(this.totalTime * 2.15);
    if (autoWobble) {
      vibrato += 0.2 * noise.simplex1(this.totalTime * 0.98);
      vibrato += 0.4 * noise.simplex1(this.totalTime * 0.5);
    }
    if (this.UIFrequency > this.smoothFrequency)
      this.smoothFrequency = Math.min(
        this.smoothFrequency * 1.1,
        this.UIFrequency
      );
    if (this.UIFrequency < this.smoothFrequency)
      this.smoothFrequency = Math.max(
        this.smoothFrequency / 1.1,
        this.UIFrequency
      );
    this.oldFrequency = this.newFrequency;
    this.newFrequency = this.smoothFrequency * (1 + vibrato);
    this.oldTenseness = this.newTenseness;
    this.newTenseness =
      this.UITenseness +
      0.1 * noise.simplex1(this.totalTime * 0.46) +
      0.05 * noise.simplex1(this.totalTime * 0.36);
    if (!this.isTouched && (alwaysVoice || this.isTouchingSomewhere))
      this.newTenseness += (3 - this.UITenseness) * (1 - this.intensity);

    if (this.isTouched || alwaysVoice || this.isTouchingSomewhere)
      this.intensity += 0.13;
    else this.intensity -= audioSystem.blockTime * 5;
    this.intensity = clamp(this.intensity, 0, 1);
  }

  setupWaveform(lambda: number) {
    this.frequency =
      this.oldFrequency * (1 - lambda) + this.newFrequency * lambda;
    const tenseness =
      this.oldTenseness * (1 - lambda) + this.newTenseness * lambda;
    this.Rd = 3 * (1 - tenseness);
    this.waveformLength = 1.0 / this.frequency;

    let Rd = this.Rd;
    if (Rd < 0.5) Rd = 0.5;
    if (Rd > 2.7) Rd = 2.7;

    // normalized to time = 1, Ee = 1
    const Ra = -0.01 + 0.048 * Rd;
    const Rk = 0.224 + 0.118 * Rd;
    const Rg =
      ((Rk / 4) * (0.5 + 1.2 * Rk)) / (0.11 * Rd - Ra * (0.5 + 1.2 * Rk));

    const Ta = Ra;
    const Tp = 1 / (2 * Rg);
    const Te = Tp + Tp * Rk; //

    const epsilon = 1 / Ta;
    const shift = Math.exp(-epsilon * (1 - Te));
    const Delta = 1 - shift; //divide by this to scale RHS

    let RHSIntegral = (1 / epsilon) * (shift - 1) + (1 - Te) * shift;
    RHSIntegral = RHSIntegral / Delta;

    const totalLowerIntegral = -(Te - Tp) / 2 + RHSIntegral;
    const totalUpperIntegral = -totalLowerIntegral;

    const omega = Math.PI / Tp;
    const s = Math.sin(omega * Te);
    // need E0*e^(alpha*Te)*s = -1 (to meet the return at -1)
    // and E0*e^(alpha*Tp/2) * Tp*2/pi = totalUpperIntegral
    //             (our approximation of the integral up to Tp)
    // writing x for e^alpha,
    // have E0*x^Te*s = -1 and E0 * x^(Tp/2) * Tp*2/pi = totalUpperIntegral
    // dividing the second by the first,
    // letting y = x^(Tp/2 - Te),
    // y * Tp*2 / (pi*s) = -totalUpperIntegral;
    const y = (-Math.PI * s * totalUpperIntegral) / (Tp * 2);
    const z = Math.log(y);
    const alpha = z / (Tp / 2 - Te);
    const E0 = -1 / (s * Math.exp(alpha * Te));
    this.alpha = alpha;
    this.E0 = E0;
    this.epsilon = epsilon;
    this.shift = shift;
    this.Delta = Delta;
    this.Te = Te;
    this.omega = omega;
  }

  normalizedLFWaveform(t: number) {
    let output;
    if (t > this.Te)
      output =
        (-Math.exp(-this.epsilon * (t - this.Te)) + this.shift) / this.Delta;
    else output = this.E0 * Math.exp(this.alpha * t) * Math.sin(this.omega * t);

    return output * this.intensity * this.loudness;
  }
}
