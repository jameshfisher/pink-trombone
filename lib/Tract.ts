import { AudioSystem, Glottis, Tract, UI, sampleRate } from "./globals";
import { clamp, moveTowards } from "./math";

export class TractClass {
  lipOutput: number;
  noseOutput: number;
  readonly n: number;
  readonly bladeStart: number;
  readonly tipStart: number;
  readonly lipStart: number;
  readonly R: Float64Array;
  readonly L: Float64Array;
  readonly reflection: Float64Array;
  readonly junctionOutputR: Float64Array;
  readonly junctionOutputL: Float64Array;
  readonly maxAmplitude: Float64Array;
  readonly diameter: Float64Array;
  readonly restDiameter: Float64Array;
  readonly targetDiameter: Float64Array;
  readonly newDiameter: Float64Array;
  readonly A: Float64Array;
  readonly glottalReflection: number;
  readonly lipReflection: number;
  lastObstruction: number;
  readonly fade: number;
  readonly movementSpeed: number;
  readonly transients: Transient[];
  velumTarget: number;
  readonly newReflection: Float64Array;
  readonly noseLength: number;
  readonly noseStart: number;
  readonly noseR: Float64Array;
  readonly noseL: Float64Array;
  readonly noseJunctionOutputR: Float64Array;
  readonly noseJunctionOutputL: Float64Array;
  readonly noseReflection: Float64Array;
  readonly noseDiameter: Float64Array;
  readonly noseA: Float64Array;
  readonly noseMaxAmplitude: Float64Array;
  newReflectionLeft: number;
  newReflectionRight: number;
  newReflectionNose: number;
  reflectionLeft: number;
  reflectionRight: number;
  reflectionNose: number;

  constructor() {
    this.n = 44;
    this.bladeStart = 10;
    this.tipStart = 32;
    this.lipStart = 39;
    this.glottalReflection = 0.75;
    this.lipReflection = -0.85;
    this.lastObstruction = -1;
    this.fade = 1.0; //0.9999
    this.movementSpeed = 15; //cm per secon
    this.transients = [];
    this.lipOutput = 0;
    this.noseOutput = 0;
    this.velumTarget = 0.01;

    this.bladeStart = Math.floor((this.bladeStart * this.n) / 44);
    this.tipStart = Math.floor((this.tipStart * this.n) / 44);
    this.lipStart = Math.floor((this.lipStart * this.n) / 44);
    this.diameter = new Float64Array(this.n);
    this.restDiameter = new Float64Array(this.n);
    this.targetDiameter = new Float64Array(this.n);
    this.newDiameter = new Float64Array(this.n);
    for (let i = 0; i < this.n; i++) {
      let diameter = 0;
      if (i < (7 * this.n) / 44 - 0.5) diameter = 0.6;
      else if (i < (12 * this.n) / 44) diameter = 1.1;
      else diameter = 1.5;
      this.diameter[i] =
        this.restDiameter[i] =
        this.targetDiameter[i] =
        this.newDiameter[i] =
          diameter;
    }
    this.R = new Float64Array(this.n);
    this.L = new Float64Array(this.n);
    this.reflection = new Float64Array(this.n + 1);
    this.newReflection = new Float64Array(this.n + 1);
    this.junctionOutputR = new Float64Array(this.n + 1);
    this.junctionOutputL = new Float64Array(this.n + 1);
    this.A = new Float64Array(this.n);
    this.maxAmplitude = new Float64Array(this.n);

    this.noseLength = Math.floor((28 * this.n) / 44);
    this.noseStart = this.n - this.noseLength + 1;
    this.noseR = new Float64Array(this.noseLength);
    this.noseL = new Float64Array(this.noseLength);
    this.noseJunctionOutputR = new Float64Array(this.noseLength + 1);
    this.noseJunctionOutputL = new Float64Array(this.noseLength + 1);
    this.noseReflection = new Float64Array(this.noseLength + 1);
    this.noseDiameter = new Float64Array(this.noseLength);
    this.noseA = new Float64Array(this.noseLength);
    this.noseMaxAmplitude = new Float64Array(this.noseLength);
    for (let i = 0; i < this.noseLength; i++) {
      let diameter: number;
      const d = 2 * (i / this.noseLength);
      if (d < 1) diameter = 0.4 + 1.6 * d;
      else diameter = 0.5 + 1.5 * (2 - d);
      diameter = Math.min(diameter, 1.9);
      this.noseDiameter[i] = diameter;
    }
    this.newReflectionLeft =
      this.newReflectionRight =
      this.newReflectionNose =
        0;
    this.reflectionLeft = 0;
    this.reflectionRight = 0;
    this.reflectionNose = 0;

    this.calculateReflections();
    this.calculateNoseReflections();
    this.noseDiameter[0] = this.velumTarget;
  }

  reshapeTract(deltaTime: number) {
    let amount = deltaTime * this.movementSpeed;
    let newLastObstruction = -1;
    for (let i = 0; i < this.n; i++) {
      const diameter = this.diameter[i];
      const targetDiameter = this.targetDiameter[i];
      if (diameter <= 0) newLastObstruction = i;
      let slowReturn;
      if (i < this.noseStart) slowReturn = 0.6;
      else if (i >= this.tipStart) slowReturn = 1.0;
      else
        slowReturn =
          0.6 + (0.4 * (i - this.noseStart)) / (this.tipStart - this.noseStart);
      this.diameter[i] = moveTowards(
        diameter,
        targetDiameter,
        slowReturn * amount,
        2 * amount
      );
    }
    if (
      this.lastObstruction > -1 &&
      newLastObstruction == -1 &&
      this.noseA[0] < 0.05
    ) {
      this.addTransient(this.lastObstruction);
    }
    this.lastObstruction = newLastObstruction;

    amount = deltaTime * this.movementSpeed;
    this.noseDiameter[0] = moveTowards(
      this.noseDiameter[0],
      this.velumTarget,
      amount * 0.25,
      amount * 0.1
    );
    this.noseA[0] = this.noseDiameter[0] * this.noseDiameter[0];
  }

  calculateReflections() {
    for (let i = 0; i < this.n; i++) {
      this.A[i] = this.diameter[i] * this.diameter[i]; //ignoring PI etc.
    }
    for (let i = 1; i < this.n; i++) {
      this.reflection[i] = this.newReflection[i];
      if (this.A[i] == 0)
        this.newReflection[i] = 0.999; //to prevent some bad behaviour if 0
      else
        this.newReflection[i] =
          (this.A[i - 1] - this.A[i]) / (this.A[i - 1] + this.A[i]);
    }

    //now at junction with nose

    this.reflectionLeft = this.newReflectionLeft;
    this.reflectionRight = this.newReflectionRight;
    this.reflectionNose = this.newReflectionNose;
    const sum =
      this.A[this.noseStart] + this.A[this.noseStart + 1] + this.noseA[0];
    this.newReflectionLeft = (2 * this.A[this.noseStart] - sum) / sum;
    this.newReflectionRight = (2 * this.A[this.noseStart + 1] - sum) / sum;
    this.newReflectionNose = (2 * this.noseA[0] - sum) / sum;
  }

  calculateNoseReflections() {
    for (let i = 0; i < this.noseLength; i++) {
      this.noseA[i] = this.noseDiameter[i] * this.noseDiameter[i];
    }
    for (let i = 1; i < this.noseLength; i++) {
      this.noseReflection[i] =
        (this.noseA[i - 1] - this.noseA[i]) /
        (this.noseA[i - 1] + this.noseA[i]);
    }
  }

  runStep(glottalOutput: number, turbulenceNoise: number, lambda: number) {
    const updateAmplitudes = Math.random() < 0.1;

    //mouth
    this.processTransients();
    this.addTurbulenceNoise(turbulenceNoise);

    //this.glottalReflection = -0.8 + 1.6 * Glottis.newTenseness;
    this.junctionOutputR[0] =
      this.L[0] * this.glottalReflection + glottalOutput;
    this.junctionOutputL[this.n] = this.R[this.n - 1] * this.lipReflection;

    for (let i = 1; i < this.n; i++) {
      const r =
        this.reflection[i] * (1 - lambda) + this.newReflection[i] * lambda;
      const w = r * (this.R[i - 1] + this.L[i]);
      this.junctionOutputR[i] = this.R[i - 1] - w;
      this.junctionOutputL[i] = this.L[i] + w;
    }

    //now at junction with nose
    const i = this.noseStart;
    let r =
      this.newReflectionLeft * (1 - lambda) + this.reflectionLeft * lambda;
    this.junctionOutputL[i] =
      r * this.R[i - 1] + (1 + r) * (this.noseL[0] + this.L[i]);
    r = this.newReflectionRight * (1 - lambda) + this.reflectionRight * lambda;
    this.junctionOutputR[i] =
      r * this.L[i] + (1 + r) * (this.R[i - 1] + this.noseL[0]);
    r = this.newReflectionNose * (1 - lambda) + this.reflectionNose * lambda;
    this.noseJunctionOutputR[0] =
      r * this.noseL[0] + (1 + r) * (this.L[i] + this.R[i - 1]);

    for (let i = 0; i < this.n; i++) {
      // this.R[i] = this.junctionOutputR[i]*0.999;
      // this.L[i] = this.junctionOutputL[i+1]*0.999;

      this.R[i] = clamp(this.junctionOutputR[i] * 0.999, -1, 1);
      this.L[i] = clamp(this.junctionOutputL[i + 1] * 0.999, -1, 1);

      if (updateAmplitudes) {
        const amplitude = Math.abs(this.R[i] + this.L[i]);
        if (amplitude > this.maxAmplitude[i]) this.maxAmplitude[i] = amplitude;
        else this.maxAmplitude[i] *= 0.999;
      }
    }

    this.lipOutput = this.R[this.n - 1];

    //nose
    this.noseJunctionOutputL[this.noseLength] =
      this.noseR[this.noseLength - 1] * this.lipReflection;

    for (let i = 1; i < this.noseLength; i++) {
      const w = this.noseReflection[i] * (this.noseR[i - 1] + this.noseL[i]);
      this.noseJunctionOutputR[i] = this.noseR[i - 1] - w;
      this.noseJunctionOutputL[i] = this.noseL[i] + w;
    }

    for (let i = 0; i < this.noseLength; i++) {
      // this.noseR[i] = this.noseJunctionOutputR[i] * this.fade;
      // this.noseL[i] = this.noseJunctionOutputL[i+1] * this.fade;

      this.noseR[i] = clamp(this.noseJunctionOutputR[i] * 0.999, -1, 1);
      this.noseL[i] = clamp(this.noseJunctionOutputL[i + 1] * 0.999, -1, 1);

      if (updateAmplitudes) {
        const amplitude = Math.abs(this.noseR[i] + this.noseL[i]);
        if (amplitude > this.noseMaxAmplitude[i])
          this.noseMaxAmplitude[i] = amplitude;
        else this.noseMaxAmplitude[i] *= 0.999;
      }
    }

    this.noseOutput = this.noseR[this.noseLength - 1];
  }

  finishBlock() {
    this.reshapeTract(AudioSystem.blockTime);
    this.calculateReflections();
  }

  addTransient(position: number) {
    const trans: Transient = {
      position: position,
      timeAlive: 0,
      lifeTime: 0.2,
      strength: 0.3,
      exponent: 200,
    };
    this.transients.push(trans);
  }

  processTransients() {
    for (let i = 0; i < this.transients.length; i++) {
      const trans = this.transients[i];
      const amplitude =
        trans.strength * Math.pow(2, -trans.exponent * trans.timeAlive);
      this.R[trans.position] += amplitude / 2;
      this.L[trans.position] += amplitude / 2;
      trans.timeAlive += 1.0 / (sampleRate * 2);
    }
    for (let i = this.transients.length - 1; i >= 0; i--) {
      const trans = this.transients[i];
      if (trans.timeAlive > trans.lifeTime) {
        this.transients.splice(i, 1);
      }
    }
  }

  addTurbulenceNoise(turbulenceNoise: number) {
    for (let j = 0; j < UI.touchesWithMouse.length; j++) {
      const touch = UI.touchesWithMouse[j];
      if (touch.index < 2 || touch.index > Tract.n) continue;
      if (touch.diameter <= 0) continue;
      const intensity = touch.fricative_intensity;
      if (intensity == 0) continue;
      this.addTurbulenceNoiseAtIndex(
        0.66 * turbulenceNoise * intensity,
        touch.index,
        touch.diameter
      );
    }
  }

  addTurbulenceNoiseAtIndex(
    turbulenceNoise: number,
    index: number,
    diameter: number
  ) {
    const i = Math.floor(index);
    const delta = index - i;
    turbulenceNoise *= Glottis.getNoiseModulator();
    const thinness0 = clamp(8 * (0.7 - diameter), 0, 1);
    const openness = clamp(30 * (diameter - 0.3), 0, 1);
    const noise0 = turbulenceNoise * (1 - delta) * thinness0 * openness;
    const noise1 = turbulenceNoise * delta * thinness0 * openness;
    this.R[i + 1] += noise0 / 2;
    this.L[i + 1] += noise0 / 2;
    this.R[i + 2] += noise1 / 2;
    this.L[i + 2] += noise1 / 2;
  }
}
