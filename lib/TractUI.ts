import {
  CANVAS_SCALE,
  glottis,
  tract,
  tractUI,
  ui,
  alwaysVoice,
  backCtx,
  palePink,
  temp,
  time,
  tractCanvas,
  tractCtx,
} from "./globals";
import * as IMAGINARY from "./i18n";
import { clamp } from "./math";

export class TractUI {
  readonly originX: number;
  readonly originY: number;
  readonly radius: number;
  readonly scale: number;
  tongueIndex: number;
  tongueDiameter: number;
  readonly innerTongueControlRadius: number;
  readonly outerTongueControlRadius: number;
  tongueTouch: TouchT | null;
  readonly angleScale: number;
  readonly angleOffset: number;
  readonly noseOffset: number;
  readonly gridOffset: number;
  readonly fillColour: string;
  readonly lineColour: string;
  ctx: CanvasRenderingContext2D;
  readonly tongueLowerIndexBound: number;
  readonly tongueUpperIndexBound: number;
  readonly tongueIndexCentre: number;

  constructor() {
    this.originX = 340;
    this.originY = 449;
    this.radius = 298;
    this.scale = 60;
    this.tongueIndex = 12.9;
    this.tongueDiameter = 2.43;
    this.innerTongueControlRadius = 2.05;
    this.outerTongueControlRadius = 3.5;
    this.tongueTouch = null;
    this.angleScale = 0.64;
    this.angleOffset = -0.24;
    this.noseOffset = 0.8;
    this.gridOffset = 1.7;
    this.fillColour = "pink";
    this.lineColour = "#C070C6";

    this.ctx = tractCtx;
    this.setRestDiameter();
    for (let i = 0; i < tract.n; i++) {
      tract.diameter[i] = tract.targetDiameter[i] = tract.restDiameter[i];
    }
    this.drawBackground();
    this.tongueLowerIndexBound = tract.bladeStart + 2;
    this.tongueUpperIndexBound = tract.tipStart - 3;
    this.tongueIndexCentre =
      0.5 * (this.tongueLowerIndexBound + this.tongueUpperIndexBound);
  }

  moveTo(i: number, d: number) {
    let angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (tract.lipStart - 1);
    let wobble =
      tract.maxAmplitude[tract.n - 1] +
      tract.noseMaxAmplitude[tract.noseLength - 1];
    wobble *= (0.03 * Math.sin(2 * i - 50 * time) * i) / tract.n;
    angle += wobble;
    const r = this.radius - this.scale * d + 100 * wobble;
    this.ctx.moveTo(
      CANVAS_SCALE * (this.originX - r * Math.cos(angle)),
      CANVAS_SCALE * (this.originY - r * Math.sin(angle))
    );
  }

  lineTo(i: number, d: number) {
    let angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (tract.lipStart - 1);
    let wobble =
      tract.maxAmplitude[tract.n - 1] +
      tract.noseMaxAmplitude[tract.noseLength - 1];
    wobble *= (0.03 * Math.sin(2 * i - 50 * time) * i) / tract.n;
    angle += wobble;
    const r = this.radius - this.scale * d + 100 * wobble;
    this.ctx.lineTo(
      CANVAS_SCALE * (this.originX - r * Math.cos(angle)),
      CANVAS_SCALE * (this.originY - r * Math.sin(angle))
    );
  }

  drawText(i: number, d: number, text: string) {
    const angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (tract.lipStart - 1);
    const r = this.radius - this.scale * d;
    this.ctx.save();
    this.ctx.translate(
      CANVAS_SCALE * (this.originX - r * Math.cos(angle)),
      CANVAS_SCALE * (this.originY - r * Math.sin(angle) + 2)
    ); //+8);
    this.ctx.rotate(angle - Math.PI / 2);
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  drawTextStraight(i: number, d: number, text: string) {
    const angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (tract.lipStart - 1);
    const r = this.radius - this.scale * d;
    this.ctx.save();
    this.ctx.translate(
      CANVAS_SCALE * (this.originX - r * Math.cos(angle)),
      CANVAS_SCALE * (this.originY - r * Math.sin(angle) + 2)
    ); //+8);
    //this.ctx.rotate(angle-Math.PI/2);
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  drawCircle(i: number, d: number, radius: number) {
    const angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (tract.lipStart - 1);
    const r = this.radius - this.scale * d;
    this.ctx.beginPath();
    this.ctx.arc(
      CANVAS_SCALE * (this.originX - r * Math.cos(angle)),
      CANVAS_SCALE * (this.originY - r * Math.sin(angle)),
      CANVAS_SCALE * radius,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  getIndex(x: number, y: number) {
    const xx = x - this.originX;
    const yy = y - this.originY;
    let angle = Math.atan2(yy, xx);
    while (angle > 0) angle -= 2 * Math.PI;
    return (
      ((Math.PI + angle - this.angleOffset) * (tract.lipStart - 1)) /
      (this.angleScale * Math.PI)
    );
  }
  getDiameter(x: number, y: number) {
    const xx = x - this.originX;
    const yy = y - this.originY;
    return (this.radius - Math.sqrt(xx * xx + yy * yy)) / this.scale;
  }

  draw() {
    this.ctx.clearRect(
      0,
      0,
      CANVAS_SCALE * tractCanvas.width,
      CANVAS_SCALE * tractCanvas.height
    );
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.drawTongueControl();
    this.drawPitchControl();

    const velum = tract.noseDiameter[0];
    const velumAngle = velum * 4;

    //first draw fill
    this.ctx.beginPath();
    this.ctx.lineWidth = CANVAS_SCALE * 2;
    this.ctx.strokeStyle = this.fillColour;
    this.ctx.fillStyle = this.fillColour;
    this.moveTo(1, 0);
    for (let i = 1; i < tract.n; i++) this.lineTo(i, tract.diameter[i]);
    for (let i = tract.n - 1; i >= 2; i--) this.lineTo(i, 0);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    //for nose
    this.ctx.beginPath();
    this.ctx.lineWidth = CANVAS_SCALE * 2;
    this.ctx.strokeStyle = this.fillColour;
    this.ctx.fillStyle = this.fillColour;
    this.moveTo(tract.noseStart, -this.noseOffset);
    for (let i = 1; i < tract.noseLength; i++)
      this.lineTo(
        i + tract.noseStart,
        -this.noseOffset - tract.noseDiameter[i] * 0.9
      );
    for (let i = tract.noseLength - 1; i >= 1; i--)
      this.lineTo(i + tract.noseStart, -this.noseOffset);
    this.ctx.closePath();
    //this.ctx.stroke();
    this.ctx.fill();

    //velum
    this.ctx.beginPath();
    this.ctx.lineWidth = CANVAS_SCALE * 2;
    this.ctx.strokeStyle = this.fillColour;
    this.ctx.fillStyle = this.fillColour;
    this.moveTo(tract.noseStart - 2, 0);
    this.lineTo(tract.noseStart, -this.noseOffset);
    this.lineTo(tract.noseStart + velumAngle, -this.noseOffset);
    this.lineTo(tract.noseStart + velumAngle - 2, 0);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    //white text
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 40px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 1.0;
    this.drawText(tract.n * 0.1, 0.425, IMAGINARY.i18n.t("THROAT"));
    this.drawText(tract.n * 0.7, -1.5, IMAGINARY.i18n.t("NASAL_CAVITY"));
    this.ctx.font = "bold 40px Quicksand";
    this.drawText(tract.n * 0.7, 0.9, IMAGINARY.i18n.t("ORAL_CAVITY"));

    this.drawAmplitudes();

    //then draw lines
    this.ctx.beginPath();
    this.ctx.lineWidth = CANVAS_SCALE * 5;
    this.ctx.strokeStyle = this.lineColour;
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.moveTo(1, tract.diameter[0]);
    for (let i = 2; i < tract.n; i++) this.lineTo(i, tract.diameter[i]);
    this.moveTo(1, 0);
    for (let i = 2; i <= tract.noseStart - 2; i++) this.lineTo(i, 0);
    this.moveTo(tract.noseStart + velumAngle - 2, 0);
    for (let i = tract.noseStart + Math.ceil(velumAngle) - 2; i < tract.n; i++)
      this.lineTo(i, 0);
    this.ctx.stroke();

    //for nose
    this.ctx.beginPath();
    this.ctx.lineWidth = CANVAS_SCALE * 5;
    this.ctx.strokeStyle = this.lineColour;
    this.ctx.lineJoin = "round";
    this.moveTo(tract.noseStart, -this.noseOffset);
    for (let i = 1; i < tract.noseLength; i++)
      this.lineTo(
        i + tract.noseStart,
        -this.noseOffset - tract.noseDiameter[i] * 0.9
      );
    this.moveTo(tract.noseStart + velumAngle, -this.noseOffset);
    for (let i = Math.ceil(velumAngle); i < tract.noseLength; i++)
      this.lineTo(i + tract.noseStart, -this.noseOffset);
    this.ctx.stroke();

    //velum
    this.ctx.globalAlpha = velum * 5;
    this.ctx.beginPath();
    this.moveTo(tract.noseStart - 2, 0);
    this.lineTo(tract.noseStart, -this.noseOffset);
    this.moveTo(tract.noseStart + velumAngle - 2, 0);
    this.lineTo(tract.noseStart + velumAngle, -this.noseOffset);
    this.ctx.stroke();

    this.ctx.fillStyle = "orchid";
    this.ctx.font = "bold 28px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 0.7;
    this.drawText(
      tract.n * 0.95,
      0.8 + 0.8 * tract.diameter[tract.n - 1],
      " " + IMAGINARY.i18n.t("LIP")
    );

    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "left";
    this.ctx.fillText(ui.debugText, CANVAS_SCALE * 20, CANVAS_SCALE * 20);
    //this.drawPositions();
  }

  drawBackground() {
    this.ctx = backCtx;

    //text
    this.ctx.fillStyle = "orchid";
    this.ctx.font = "bold 28px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 0.7;
    this.drawText(tract.n * 0.44, -0.28, IMAGINARY.i18n.t("SOFT_PALATE_1"));
    this.drawText(
      tract.n *
        (0.47 +
          this.ctx.measureText(IMAGINARY.i18n.t("SOFT_PALATE_1")).width *
            0.001),
      -0.28,
      IMAGINARY.i18n.t("SOFT_PALATE_2")
    );
    this.drawText(tract.n * 0.74, -0.28, IMAGINARY.i18n.t("HARD_PALATE_1"));
    this.drawText(
      tract.n *
        (0.77 +
          +this.ctx.measureText(IMAGINARY.i18n.t("HARD_PALATE_1")).width *
            0.001),
      -0.28,
      IMAGINARY.i18n.t("HARD_PALATE_2")
    );
    this.drawText(tract.n * 0.95, -0.28, " " + IMAGINARY.i18n.t("LIP"));

    this.ctx.font = "bold 28px Quicksand";
    this.drawTextStraight(
      tract.n * 0.18,
      3,
      "  " + IMAGINARY.i18n.t("TONGUE_CONTROL")
    );
    this.ctx.textAlign = "left";
    this.drawText(tract.n * 1.01, -1.07, IMAGINARY.i18n.t("NASALS"));
    this.drawText(tract.n * 1.01, -0.28, IMAGINARY.i18n.t("STOPS"));
    this.drawText(tract.n * 1.01, 0.51, IMAGINARY.i18n.t("FRICATIVES"));
    //this.drawTextStraight(1.5, +0.8, "glottis")
    this.ctx.strokeStyle = "orchid";
    this.ctx.lineWidth = CANVAS_SCALE * 2;
    this.ctx.beginPath();
    this.moveTo(tract.n * 1.01, 0);
    this.lineTo(tract.n * 1.04, 0);
    this.moveTo(tract.n * 1.01, -this.noseOffset);
    this.lineTo(tract.n * 1.04, -this.noseOffset);
    this.ctx.stroke();
    this.ctx.globalAlpha = 0.9;
    this.ctx.globalAlpha = 1.0;
    this.ctx = tractCtx;
  }

  drawPositions() {
    this.ctx.fillStyle = "orchid";
    this.ctx.font = "bold 48px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 0.6;
    const a = 2;
    const b = 1.5;
    this.drawText(15, a + b * 0.6, "æ"); //pat
    this.drawText(13, a + b * 0.27, "ɑ"); //part
    this.drawText(12, a + b * 0.0, "ɒ"); //pot
    this.drawText(17.7, a + b * 0.05, "(ɔ)"); //port (rounded)
    this.drawText(27, a + b * 0.65, "ɪ"); //pit
    this.drawText(27.4, a + b * 0.21, "i"); //peat
    this.drawText(20, a + b * 1.0, "e"); //pet
    this.drawText(18.1, a + b * 0.37, "ʌ"); //putt
    //put ʊ
    this.drawText(23, a + b * 0.1, "(u)"); //poot (rounded)
    this.drawText(21, a + b * 0.6, "ə"); //pert [should be ɜ]

    const nasals = -1.1;
    const stops = -0.4;
    const fricatives = 0.3;
    const approximants = 1.1;
    this.ctx.globalAlpha = 0.8;

    //approximants
    this.drawText(38, approximants, "l");
    this.drawText(41, approximants, "w");

    //?
    this.drawText(4.5, 0.37, "h");

    if (glottis.isTouched || alwaysVoice) {
      //voiced consonants
      this.drawText(31.5, fricatives, "ʒ");
      this.drawText(36, fricatives, "z");
      this.drawText(41, fricatives, "v");
      this.drawText(22, stops, "g");
      this.drawText(36, stops, "d");
      this.drawText(41, stops, "b");
      this.drawText(22, nasals, "ŋ");
      this.drawText(36, nasals, "n");
      this.drawText(41, nasals, "m");
    } else {
      //unvoiced consonants
      this.drawText(31.5, fricatives, "ʃ");
      this.drawText(36, fricatives, "s");
      this.drawText(41, fricatives, "f");
      this.drawText(22, stops, "k");
      this.drawText(36, stops, "t");
      this.drawText(41, stops, "p");
      this.drawText(22, nasals, "ŋ");
      this.drawText(36, nasals, "n");
      this.drawText(41, nasals, "m");
    }
  }

  drawAmplitudes() {
    this.ctx.strokeStyle = "orchid";
    this.ctx.lineCap = "butt";
    this.ctx.globalAlpha = 0.3;
    for (let i = 2; i < tract.n - 1; i++) {
      const lineWidth = Math.sqrt(tract.maxAmplitude[i]) * 3;
      if (lineWidth > 0) {
        this.ctx.beginPath();
        this.ctx.lineWidth = CANVAS_SCALE * lineWidth;
        this.moveTo(i, 0);
        this.lineTo(i, tract.diameter[i]);
        this.ctx.stroke();
      }
    }
    for (let i = 1; i < tract.noseLength - 1; i++) {
      const lineWidth = Math.sqrt(tract.noseMaxAmplitude[i]) * 3;
      if (lineWidth > 0) {
        this.ctx.beginPath();
        this.ctx.lineWidth = CANVAS_SCALE * lineWidth;
        this.moveTo(i + tract.noseStart, -this.noseOffset);
        this.lineTo(
          i + tract.noseStart,
          -this.noseOffset - tract.noseDiameter[i] * 0.9
        );
        this.ctx.stroke();
      }
    }
    this.ctx.globalAlpha = 1;
  }

  drawTongueControl() {
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.strokeStyle = palePink;
    this.ctx.fillStyle = palePink;
    this.ctx.globalAlpha = 1.0;
    this.ctx.beginPath();
    this.ctx.lineWidth = CANVAS_SCALE * 45;

    //outline
    this.moveTo(this.tongueLowerIndexBound, this.innerTongueControlRadius);
    for (
      let i = this.tongueLowerIndexBound + 1;
      i <= this.tongueUpperIndexBound;
      i++
    )
      this.lineTo(i, this.innerTongueControlRadius);
    this.lineTo(this.tongueIndexCentre, this.outerTongueControlRadius);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    const a = this.innerTongueControlRadius;
    const c = this.outerTongueControlRadius;
    const b = 0.5 * (a + c);
    const r = 3;
    this.ctx.fillStyle = "orchid";
    this.ctx.globalAlpha = 0.3;
    this.drawCircle(this.tongueIndexCentre, a, r);
    this.drawCircle(this.tongueIndexCentre - 4.25, a, r);
    this.drawCircle(this.tongueIndexCentre - 8.5, a, r);
    this.drawCircle(this.tongueIndexCentre + 4.25, a, r);
    this.drawCircle(this.tongueIndexCentre + 8.5, a, r);
    this.drawCircle(this.tongueIndexCentre - 6.1, b, r);
    this.drawCircle(this.tongueIndexCentre + 6.1, b, r);
    this.drawCircle(this.tongueIndexCentre, b, r);
    this.drawCircle(this.tongueIndexCentre, c, r);

    this.ctx.globalAlpha = 1.0;

    //circle for tongue position
    const angle =
      this.angleOffset +
      (this.tongueIndex * this.angleScale * Math.PI) / (tract.lipStart - 1);
    const r2 = this.radius - this.scale * this.tongueDiameter;
    const x = this.originX - r2 * Math.cos(angle);
    const y = this.originY - r2 * Math.sin(angle);
    this.ctx.lineWidth = CANVAS_SCALE * 4;
    this.ctx.strokeStyle = "orchid";
    this.ctx.globalAlpha = 0.7;
    this.ctx.beginPath();
    this.ctx.arc(
      CANVAS_SCALE * x,
      CANVAS_SCALE * y,
      CANVAS_SCALE * 18,
      0,
      2 * Math.PI
    );
    this.ctx.stroke();
    this.ctx.globalAlpha = 0.15;
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

    this.ctx.fillStyle = "orchid";
  }

  drawPitchControl() {
    const w = 9;
    const h = 15;
    if (glottis.x) {
      this.ctx.lineWidth = CANVAS_SCALE * 4;
      this.ctx.strokeStyle = "orchid";
      this.ctx.globalAlpha = 0.7;
      this.ctx.beginPath();
      this.ctx.moveTo(
        CANVAS_SCALE * (glottis.x - w),
        CANVAS_SCALE * (glottis.y - h)
      );
      this.ctx.lineTo(
        CANVAS_SCALE * (glottis.x + w),
        CANVAS_SCALE * (glottis.y - h)
      );
      this.ctx.lineTo(
        CANVAS_SCALE * (glottis.x + w),
        CANVAS_SCALE * (glottis.y + h)
      );
      this.ctx.lineTo(
        CANVAS_SCALE * (glottis.x - w),
        CANVAS_SCALE * (glottis.y + h)
      );
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.globalAlpha = 0.15;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
  }

  setRestDiameter() {
    for (let i = tract.bladeStart; i < tract.lipStart; i++) {
      const t =
        (1.1 * Math.PI * (this.tongueIndex - i)) /
        (tract.tipStart - tract.bladeStart);
      const fixedTongueDiameter = 2 + (this.tongueDiameter - 2) / 1.5;
      let curve = (1.5 - fixedTongueDiameter + this.gridOffset) * Math.cos(t);
      if (i == tract.bladeStart - 2 || i == tract.lipStart - 1) curve *= 0.8;
      if (i == tract.bladeStart || i == tract.lipStart - 2) curve *= 0.94;
      tract.restDiameter[i] = 1.5 - curve;
    }
  }

  handleTouches() {
    if (this.tongueTouch != null && !this.tongueTouch.alive)
      this.tongueTouch = null;

    if (this.tongueTouch == null) {
      for (let j = 0; j < ui.touchesWithMouse.length; j++) {
        const touch = ui.touchesWithMouse[j];
        if (!touch.alive) continue;
        if (touch.fricative_intensity == 1) continue; //only new touches will pass this
        const x = touch.x;
        const y = touch.y;
        const index = tractUI.getIndex(x, y);
        const diameter = tractUI.getDiameter(x, y);
        if (
          index >= this.tongueLowerIndexBound - 4 &&
          index <= this.tongueUpperIndexBound + 4 &&
          diameter >= this.innerTongueControlRadius - 0.5 &&
          diameter <= this.outerTongueControlRadius + 0.5
        ) {
          this.tongueTouch = touch;
        }
      }
    }

    if (this.tongueTouch != null) {
      const x = this.tongueTouch.x;
      const y = this.tongueTouch.y;
      const index = tractUI.getIndex(x, y);
      const diameter = tractUI.getDiameter(x, y);
      let fromPoint =
        (this.outerTongueControlRadius - diameter) /
        (this.outerTongueControlRadius - this.innerTongueControlRadius);
      fromPoint = clamp(fromPoint, 0, 1);
      fromPoint =
        Math.pow(fromPoint, 0.58) - 0.2 * (fromPoint * fromPoint - fromPoint); //horrible kludge to fit curve to straight line
      this.tongueDiameter = clamp(
        diameter,
        this.innerTongueControlRadius,
        this.outerTongueControlRadius
      );
      //this.tongueIndex = clamp(index, this.tongueLowerIndexBound, this.tongueUpperIndexBound);
      const out =
        fromPoint *
        0.5 *
        (this.tongueUpperIndexBound - this.tongueLowerIndexBound);
      this.tongueIndex = clamp(
        index,
        this.tongueIndexCentre - out,
        this.tongueIndexCentre + out
      );
    }

    this.setRestDiameter();
    for (let i = 0; i < tract.n; i++)
      tract.targetDiameter[i] = tract.restDiameter[i];

    //other constrictions and nose
    tract.velumTarget = 0.01;
    for (let j = 0; j < ui.touchesWithMouse.length; j++) {
      const touch = ui.touchesWithMouse[j];
      if (!touch.alive) continue;
      const x = touch.x;
      const y = touch.y;
      const index = tractUI.getIndex(x, y);
      let diameter = tractUI.getDiameter(x, y);
      if (index > tract.noseStart && diameter < -this.noseOffset) {
        tract.velumTarget = 0.4;
      }
      temp.a = index;
      temp.b = diameter;
      if (diameter < -0.85 - this.noseOffset) continue;
      diameter -= 0.3;
      if (diameter < 0) diameter = 0;
      let width = 2;
      if (index < 25) width = 10;
      else if (index >= tract.tipStart) width = 5;
      else width = 10 - (5 * (index - 25)) / (tract.tipStart - 25);
      if (
        index >= 2 &&
        index < tract.n &&
        y < tractCanvas.height &&
        diameter < 3
      ) {
        const intIndex = Math.round(index);
        for (let i = -Math.ceil(width) - 1; i < width + 1; i++) {
          if (intIndex + i < 0 || intIndex + i >= tract.n) continue;
          let relpos = intIndex + i - index;
          relpos = Math.abs(relpos) - 0.5;
          let shrink;
          if (relpos <= 0) shrink = 0;
          else if (relpos > width) shrink = 1;
          else shrink = 0.5 * (1 - Math.cos((Math.PI * relpos) / width));
          if (diameter < tract.targetDiameter[intIndex + i]) {
            tract.targetDiameter[intIndex + i] =
              diameter +
              (tract.targetDiameter[intIndex + i] - diameter) * shrink;
          }
        }
      }
    }
  }
}
