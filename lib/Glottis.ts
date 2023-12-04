import * as IMAGINARY from "./i18n";
import * as noise from "./noise";
import {
  palePink,
  sampleRate,
  autoWobble,
  alwaysVoice,
  AudioSystem,
  Glottis,
  UI,
  backCtx,
} from "./globals";

export class GlottisClass {
  timeInWaveform: number;
  oldFrequency: number;
  newFrequency: number;
  UIFrequency: number;
  smoothFrequency: number;
  oldTenseness: number;
  newTenseness: number;
  UITenseness: number;
  totalTime: number;
  vibratoAmount: number;
  vibratoFrequency: number;
  intensity: number;
  loudness: number;
  isTouched: boolean;
  isTouchingSomewhere: boolean;
  ctx: CanvasRenderingContext2D;
  touch: TouchT | null;
  x: number;
  y: number;
  keyboardTop: number;
  keyboardLeft: number;
  keyboardWidth: number;
  keyboardHeight: number;
  semitones: number;
  marks: number[];
  baseNote: number;
  waveformLength: any;
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
    this.vibratoAmount = 0.005;
    this.vibratoFrequency = 6;
    this.intensity = 0;
    this.loudness = 1;
    this.isTouched = false;
    this.isTouchingSomewhere = false;
    this.ctx = backCtx;
    this.touch = null;
    this.x = 240;
    this.y = 530;
    this.keyboardTop = 500;
    this.keyboardLeft = 0;
    this.keyboardWidth = 600;
    this.keyboardHeight = 100;
    this.semitones = 20;
    this.marks = [0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0];
    this.baseNote = 87.3071; // F

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

    var radius = 2;

    this.drawBar(0.0, 0.4, 8);
    backCtx.globalAlpha = 0.7;
    this.drawBar(0.52, 0.72, 8);

    backCtx.strokeStyle = "orchid";
    backCtx.fillStyle = "orchid";
    for (var i = 0; i < this.semitones; i++) {
      var keyWidth = this.keyboardWidth / this.semitones;
      var x = this.keyboardLeft + (i + 1 / 2) * keyWidth;
      var y = this.keyboardTop;
      if (this.marks[(i + 3) % 12] == 1) {
        backCtx.lineWidth = 4;
        backCtx.globalAlpha = 0.4;
      } else {
        backCtx.lineWidth = 3;
        backCtx.globalAlpha = 0.2;
      }
      backCtx.beginPath();
      backCtx.moveTo(x, y + 9);
      backCtx.lineTo(x, y + this.keyboardHeight * 0.4 - 9);
      backCtx.stroke();

      backCtx.lineWidth = 3;
      backCtx.globalAlpha = 0.15;

      backCtx.beginPath();
      backCtx.moveTo(x, y + this.keyboardHeight * 0.52 + 6);
      backCtx.lineTo(x, y + this.keyboardHeight * 0.72 - 6);
      backCtx.stroke();
    }

    backCtx.fillStyle = "orchid";
    backCtx.font = "bold 14px Quicksand";
    backCtx.textAlign = "center";
    backCtx.globalAlpha = 0.7;
    backCtx.fillText(IMAGINARY.i18n.t("VOICEBOX_CONTROL"), 300, 490);
    backCtx.fillText(IMAGINARY.i18n.t("PITCH"), 300, 592);
    backCtx.globalAlpha = 0.3;
    backCtx.strokeStyle = "orchid";
    backCtx.fillStyle = "orchid";
    backCtx.save();
    backCtx.translate(430, 587);
    this.drawArrow(80, 2, 10);
    backCtx.translate(-260, 0);
    backCtx.rotate(Math.PI);
    this.drawArrow(80, 2, 10);
    backCtx.restore();
    backCtx.globalAlpha = 1.0;
  }

  drawBar(topFactor: number, bottomFactor: number, radius: number) {
    backCtx.lineWidth = radius * 2;
    backCtx.beginPath();
    backCtx.moveTo(
      this.keyboardLeft + radius,
      this.keyboardTop + topFactor * this.keyboardHeight + radius
    );
    backCtx.lineTo(
      this.keyboardLeft + this.keyboardWidth - radius,
      this.keyboardTop + topFactor * this.keyboardHeight + radius
    );
    backCtx.lineTo(
      this.keyboardLeft + this.keyboardWidth - radius,
      this.keyboardTop + bottomFactor * this.keyboardHeight - radius
    );
    backCtx.lineTo(
      this.keyboardLeft + radius,
      this.keyboardTop + bottomFactor * this.keyboardHeight - radius
    );
    backCtx.closePath();
    backCtx.stroke();
    backCtx.fill();
  }

  drawArrow(l: number, ahw: number, ahl: number) {
    backCtx.lineWidth = 2;
    backCtx.beginPath();
    backCtx.moveTo(-l, 0);
    backCtx.lineTo(0, 0);
    backCtx.lineTo(0, -ahw);
    backCtx.lineTo(ahl, 0);
    backCtx.lineTo(0, ahw);
    backCtx.lineTo(0, 0);
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
      for (var j = 0; j < UI.touchesWithMouse.length; j++) {
        var touch = UI.touchesWithMouse[j];
        if (!touch.alive) continue;
        this.isTouchingSomewhere = true;
        if (touch.y < this.keyboardTop) continue;
        this.touch = touch;
      }
    }

    if (this.touch != null) {
      this.isTouchingSomewhere = true;
      var local_y = this.touch.y - this.keyboardTop - 10;
      var local_x = this.touch.x - this.keyboardLeft;
      local_y = Math.clamp(local_y, 0, this.keyboardHeight - 26);
      var semitone = (this.semitones * local_x) / this.keyboardWidth + 0.5;
      Glottis.UIFrequency = this.baseNote * Math.pow(2, semitone / 12);
      if (Glottis.intensity == 0) Glottis.smoothFrequency = Glottis.UIFrequency;
      //Glottis.UIRd = 3*local_y / (this.keyboardHeight-20);
      var t = Math.clamp(1 - local_y / (this.keyboardHeight - 28), 0, 1);
      Glottis.UITenseness = 1 - Math.cos(t * Math.PI * 0.5);
      Glottis.loudness = Math.pow(Glottis.UITenseness, 0.25);
      this.x = this.touch.x;
      this.y = local_y + this.keyboardTop + 10;
    }
    Glottis.isTouched = this.touch != null;
  }

  runStep(lambda: number, noiseSource: number) {
    var timeStep = 1.0 / sampleRate;
    this.timeInWaveform += timeStep;
    this.totalTime += timeStep;
    if (this.timeInWaveform > this.waveformLength) {
      this.timeInWaveform -= this.waveformLength;
      this.setupWaveform(lambda);
    }
    var out = this.normalizedLFWaveform(
      this.timeInWaveform / this.waveformLength
    );
    var aspiration =
      this.intensity *
      (1 - Math.sqrt(this.UITenseness)) *
      this.getNoiseModulator() *
      noiseSource;
    aspiration *= 0.2 + 0.02 * noise.simplex1(this.totalTime * 1.99);
    out += aspiration;
    return out;
  }

  getNoiseModulator() {
    var voiced =
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
    var vibrato = 0;
    vibrato +=
      this.vibratoAmount *
      Math.sin(2 * Math.PI * this.totalTime * this.vibratoFrequency);
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
    else this.intensity -= AudioSystem.blockTime * 5;
    this.intensity = Math.clamp(this.intensity, 0, 1);
  }

  setupWaveform(lambda: number) {
    this.frequency =
      this.oldFrequency * (1 - lambda) + this.newFrequency * lambda;
    var tenseness =
      this.oldTenseness * (1 - lambda) + this.newTenseness * lambda;
    this.Rd = 3 * (1 - tenseness);
    this.waveformLength = 1.0 / this.frequency;

    var Rd = this.Rd;
    if (Rd < 0.5) Rd = 0.5;
    if (Rd > 2.7) Rd = 2.7;

    // normalized to time = 1, Ee = 1
    var Ra = -0.01 + 0.048 * Rd;
    var Rk = 0.224 + 0.118 * Rd;
    var Rg =
      ((Rk / 4) * (0.5 + 1.2 * Rk)) / (0.11 * Rd - Ra * (0.5 + 1.2 * Rk));

    var Ta = Ra;
    var Tp = 1 / (2 * Rg);
    var Te = Tp + Tp * Rk; //

    var epsilon = 1 / Ta;
    var shift = Math.exp(-epsilon * (1 - Te));
    var Delta = 1 - shift; //divide by this to scale RHS

    var RHSIntegral = (1 / epsilon) * (shift - 1) + (1 - Te) * shift;
    RHSIntegral = RHSIntegral / Delta;

    var totalLowerIntegral = -(Te - Tp) / 2 + RHSIntegral;
    var totalUpperIntegral = -totalLowerIntegral;

    var omega = Math.PI / Tp;
    var s = Math.sin(omega * Te);
    // need E0*e^(alpha*Te)*s = -1 (to meet the return at -1)
    // and E0*e^(alpha*Tp/2) * Tp*2/pi = totalUpperIntegral
    //             (our approximation of the integral up to Tp)
    // writing x for e^alpha,
    // have E0*x^Te*s = -1 and E0 * x^(Tp/2) * Tp*2/pi = totalUpperIntegral
    // dividing the second by the first,
    // letting y = x^(Tp/2 - Te),
    // y * Tp*2 / (pi*s) = -totalUpperIntegral;
    var y = (-Math.PI * s * totalUpperIntegral) / (Tp * 2);
    var z = Math.log(y);
    var alpha = z / (Tp / 2 - Te);
    var E0 = -1 / (s * Math.exp(alpha * Te));
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
