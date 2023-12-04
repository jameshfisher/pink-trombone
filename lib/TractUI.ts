import * as IMAGINARY from "./i18n";
import {
  tractCtx,
  Tract,
  time,
  tractCanvas,
  UI,
  backCtx,
  Glottis,
  alwaysVoice,
  palePink,
  TractUI,
  temp,
} from "./globals";

export class TractUIClass {
  originX: number;
  originY: number;
  radius: number;
  scale: number;
  tongueIndex: number;
  tongueDiameter: number;
  innerTongueControlRadius: number;
  outerTongueControlRadius: number;
  tongueTouch: TouchT | null;
  angleScale: number;
  angleOffset: number;
  noseOffset: number;
  gridOffset: number;
  fillColour: string;
  lineColour: string;
  ctx: CanvasRenderingContext2D;
  tongueLowerIndexBound: number;
  tongueUpperIndexBound: number;
  tongueIndexCentre: number;

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
    for (var i = 0; i < Tract.n; i++) {
      Tract.diameter[i] = Tract.targetDiameter[i] = Tract.restDiameter[i];
    }
    this.drawBackground();
    this.tongueLowerIndexBound = Tract.bladeStart + 2;
    this.tongueUpperIndexBound = Tract.tipStart - 3;
    this.tongueIndexCentre =
      0.5 * (this.tongueLowerIndexBound + this.tongueUpperIndexBound);
  }

  moveTo(i: number, d: number) {
    var angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (Tract.lipStart - 1);
    var wobble =
      Tract.maxAmplitude[Tract.n - 1] +
      Tract.noseMaxAmplitude[Tract.noseLength - 1];
    wobble *= (0.03 * Math.sin(2 * i - 50 * time) * i) / Tract.n;
    angle += wobble;
    var r = this.radius - this.scale * d + 100 * wobble;
    this.ctx.moveTo(
      this.originX - r * Math.cos(angle),
      this.originY - r * Math.sin(angle)
    );
  }

  lineTo(i: number, d: number) {
    var angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (Tract.lipStart - 1);
    var wobble =
      Tract.maxAmplitude[Tract.n - 1] +
      Tract.noseMaxAmplitude[Tract.noseLength - 1];
    wobble *= (0.03 * Math.sin(2 * i - 50 * time) * i) / Tract.n;
    angle += wobble;
    var r = this.radius - this.scale * d + 100 * wobble;
    this.ctx.lineTo(
      this.originX - r * Math.cos(angle),
      this.originY - r * Math.sin(angle)
    );
  }

  drawText(i: number, d: number, text: string) {
    var angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (Tract.lipStart - 1);
    var r = this.radius - this.scale * d;
    this.ctx.save();
    this.ctx.translate(
      this.originX - r * Math.cos(angle),
      this.originY - r * Math.sin(angle) + 2
    ); //+8);
    this.ctx.rotate(angle - Math.PI / 2);
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  drawTextStraight(i: number, d: number, text: string) {
    var angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (Tract.lipStart - 1);
    var r = this.radius - this.scale * d;
    this.ctx.save();
    this.ctx.translate(
      this.originX - r * Math.cos(angle),
      this.originY - r * Math.sin(angle) + 2
    ); //+8);
    //this.ctx.rotate(angle-Math.PI/2);
    this.ctx.fillText(text, 0, 0);
    this.ctx.restore();
  }

  drawCircle(i: number, d: number, radius: number) {
    var angle =
      this.angleOffset + (i * this.angleScale * Math.PI) / (Tract.lipStart - 1);
    var r = this.radius - this.scale * d;
    this.ctx.beginPath();
    this.ctx.arc(
      this.originX - r * Math.cos(angle),
      this.originY - r * Math.sin(angle),
      radius,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
  }

  getIndex(x: number, y: number) {
    var xx = x - this.originX;
    var yy = y - this.originY;
    var angle = Math.atan2(yy, xx);
    while (angle > 0) angle -= 2 * Math.PI;
    return (
      ((Math.PI + angle - this.angleOffset) * (Tract.lipStart - 1)) /
      (this.angleScale * Math.PI)
    );
  }
  getDiameter(x: number, y: number) {
    var xx = x - this.originX;
    var yy = y - this.originY;
    return (this.radius - Math.sqrt(xx * xx + yy * yy)) / this.scale;
  }

  draw() {
    this.ctx.clearRect(0, 0, tractCanvas.width, tractCanvas.height);
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.drawTongueControl();
    this.drawPitchControl();

    var velum = Tract.noseDiameter[0];
    var velumAngle = velum * 4;

    //first draw fill
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.fillColour;
    this.ctx.fillStyle = this.fillColour;
    this.moveTo(1, 0);
    for (var i = 1; i < Tract.n; i++) this.lineTo(i, Tract.diameter[i]);
    for (var i = Tract.n - 1; i >= 2; i--) this.lineTo(i, 0);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    //for nose
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.fillColour;
    this.ctx.fillStyle = this.fillColour;
    this.moveTo(Tract.noseStart, -this.noseOffset);
    for (var i = 1; i < Tract.noseLength; i++)
      this.lineTo(
        i + Tract.noseStart,
        -this.noseOffset - Tract.noseDiameter[i] * 0.9
      );
    for (var i = Tract.noseLength - 1; i >= 1; i--)
      this.lineTo(i + Tract.noseStart, -this.noseOffset);
    this.ctx.closePath();
    //this.ctx.stroke();
    this.ctx.fill();

    //velum
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.fillColour;
    this.ctx.fillStyle = this.fillColour;
    this.moveTo(Tract.noseStart - 2, 0);
    this.lineTo(Tract.noseStart, -this.noseOffset);
    this.lineTo(Tract.noseStart + velumAngle, -this.noseOffset);
    this.lineTo(Tract.noseStart + velumAngle - 2, 0);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    //white text
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 20px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 1.0;
    this.drawText(Tract.n * 0.1, 0.425, IMAGINARY.i18n.t("THROAT"));
    this.drawText(Tract.n * 0.7, -1.5, IMAGINARY.i18n.t("NASAL_CAVITY"));
    this.ctx.font = "bold 20px Quicksand";
    this.drawText(Tract.n * 0.7, 0.9, IMAGINARY.i18n.t("ORAL_CAVITY"));

    this.drawAmplitudes();

    //then draw lines
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = this.lineColour;
    this.ctx.lineJoin = "round";
    this.ctx.lineCap = "round";
    this.moveTo(1, Tract.diameter[0]);
    for (var i = 2; i < Tract.n; i++) this.lineTo(i, Tract.diameter[i]);
    this.moveTo(1, 0);
    for (var i = 2; i <= Tract.noseStart - 2; i++) this.lineTo(i, 0);
    this.moveTo(Tract.noseStart + velumAngle - 2, 0);
    for (var i = Tract.noseStart + Math.ceil(velumAngle) - 2; i < Tract.n; i++)
      this.lineTo(i, 0);
    this.ctx.stroke();

    //for nose
    this.ctx.beginPath();
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = this.lineColour;
    this.ctx.lineJoin = "round";
    this.moveTo(Tract.noseStart, -this.noseOffset);
    for (var i = 1; i < Tract.noseLength; i++)
      this.lineTo(
        i + Tract.noseStart,
        -this.noseOffset - Tract.noseDiameter[i] * 0.9
      );
    this.moveTo(Tract.noseStart + velumAngle, -this.noseOffset);
    for (var i = Math.ceil(velumAngle); i < Tract.noseLength; i++)
      this.lineTo(i + Tract.noseStart, -this.noseOffset);
    this.ctx.stroke();

    //velum
    this.ctx.globalAlpha = velum * 5;
    this.ctx.beginPath();
    this.moveTo(Tract.noseStart - 2, 0);
    this.lineTo(Tract.noseStart, -this.noseOffset);
    this.moveTo(Tract.noseStart + velumAngle - 2, 0);
    this.lineTo(Tract.noseStart + velumAngle, -this.noseOffset);
    this.ctx.stroke();

    this.ctx.fillStyle = "orchid";
    this.ctx.font = "bold 14px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 0.7;
    this.drawText(
      Tract.n * 0.95,
      0.8 + 0.8 * Tract.diameter[Tract.n - 1],
      " " + IMAGINARY.i18n.t("LIP")
    );

    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = "black";
    this.ctx.textAlign = "left";
    this.ctx.fillText(UI.debugText, 20, 20);
    //this.drawPositions();
  }

  drawBackground() {
    this.ctx = backCtx;

    //text
    this.ctx.fillStyle = "orchid";
    this.ctx.font = "bold 14px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 0.7;
    this.drawText(Tract.n * 0.44, -0.28, IMAGINARY.i18n.t("SOFT_PALATE_1"));
    this.drawText(
      Tract.n *
        (0.47 +
          this.ctx.measureText(IMAGINARY.i18n.t("SOFT_PALATE_1")).width *
            0.001),
      -0.28,
      IMAGINARY.i18n.t("SOFT_PALATE_2")
    );
    this.drawText(Tract.n * 0.74, -0.28, IMAGINARY.i18n.t("HARD_PALATE_1"));
    this.drawText(
      Tract.n *
        (0.77 +
          +this.ctx.measureText(IMAGINARY.i18n.t("HARD_PALATE_1")).width *
            0.001),
      -0.28,
      IMAGINARY.i18n.t("HARD_PALATE_2")
    );
    this.drawText(Tract.n * 0.95, -0.28, " " + IMAGINARY.i18n.t("LIP"));

    this.ctx.font = "bold 14px Quicksand";
    this.drawTextStraight(
      Tract.n * 0.18,
      3,
      "  " + IMAGINARY.i18n.t("TONGUE_CONTROL")
    );
    this.ctx.textAlign = "left";
    this.drawText(Tract.n * 1.01, -1.07, IMAGINARY.i18n.t("NASALS"));
    this.drawText(Tract.n * 1.01, -0.28, IMAGINARY.i18n.t("STOPS"));
    this.drawText(Tract.n * 1.01, 0.51, IMAGINARY.i18n.t("FRICATIVES"));
    //this.drawTextStraight(1.5, +0.8, "glottis")
    this.ctx.strokeStyle = "orchid";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.moveTo(Tract.n * 1.01, 0);
    this.lineTo(Tract.n * 1.04, 0);
    this.moveTo(Tract.n * 1.01, -this.noseOffset);
    this.lineTo(Tract.n * 1.04, -this.noseOffset);
    this.ctx.stroke();
    this.ctx.globalAlpha = 0.9;
    this.ctx.globalAlpha = 1.0;
    this.ctx = tractCtx;
  }

  drawPositions() {
    this.ctx.fillStyle = "orchid";
    this.ctx.font = "bold 24px Quicksand";
    this.ctx.textAlign = "center";
    this.ctx.globalAlpha = 0.6;
    var a = 2;
    var b = 1.5;
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

    var nasals = -1.1;
    var stops = -0.4;
    var fricatives = 0.3;
    var approximants = 1.1;
    this.ctx.globalAlpha = 0.8;

    //approximants
    this.drawText(38, approximants, "l");
    this.drawText(41, approximants, "w");

    //?
    this.drawText(4.5, 0.37, "h");

    if (Glottis.isTouched || alwaysVoice) {
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
    for (var i = 2; i < Tract.n - 1; i++) {
      var lineWidth = Math.sqrt(Tract.maxAmplitude[i]) * 3;
      if (lineWidth > 0) {
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.moveTo(i, 0);
        this.lineTo(i, Tract.diameter[i]);
        this.ctx.stroke();
      }
    }
    for (var i = 1; i < Tract.noseLength - 1; i++) {
      var lineWidth = Math.sqrt(Tract.noseMaxAmplitude[i]) * 3;
      if (lineWidth > 0) {
        this.ctx.beginPath();
        this.ctx.lineWidth = lineWidth;
        this.moveTo(i + Tract.noseStart, -this.noseOffset);
        this.lineTo(
          i + Tract.noseStart,
          -this.noseOffset - Tract.noseDiameter[i] * 0.9
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
    this.ctx.lineWidth = 45;

    //outline
    this.moveTo(this.tongueLowerIndexBound, this.innerTongueControlRadius);
    for (
      var i = this.tongueLowerIndexBound + 1;
      i <= this.tongueUpperIndexBound;
      i++
    )
      this.lineTo(i, this.innerTongueControlRadius);
    this.lineTo(this.tongueIndexCentre, this.outerTongueControlRadius);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.fill();

    var a = this.innerTongueControlRadius;
    var c = this.outerTongueControlRadius;
    var b = 0.5 * (a + c);
    var r = 3;
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
    var angle =
      this.angleOffset +
      (this.tongueIndex * this.angleScale * Math.PI) / (Tract.lipStart - 1);
    var r = this.radius - this.scale * this.tongueDiameter;
    var x = this.originX - r * Math.cos(angle);
    var y = this.originY - r * Math.sin(angle);
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = "orchid";
    this.ctx.globalAlpha = 0.7;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 18, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.globalAlpha = 0.15;
    this.ctx.fill();
    this.ctx.globalAlpha = 1.0;

    this.ctx.fillStyle = "orchid";
  }

  drawPitchControl() {
    var w = 9;
    var h = 15;
    if (Glottis.x) {
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = "orchid";
      this.ctx.globalAlpha = 0.7;
      this.ctx.beginPath();
      this.ctx.moveTo(Glottis.x - w, Glottis.y - h);
      this.ctx.lineTo(Glottis.x + w, Glottis.y - h);
      this.ctx.lineTo(Glottis.x + w, Glottis.y + h);
      this.ctx.lineTo(Glottis.x - w, Glottis.y + h);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.globalAlpha = 0.15;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
  }

  setRestDiameter() {
    for (var i = Tract.bladeStart; i < Tract.lipStart; i++) {
      var t =
        (1.1 * Math.PI * (this.tongueIndex - i)) /
        (Tract.tipStart - Tract.bladeStart);
      var fixedTongueDiameter = 2 + (this.tongueDiameter - 2) / 1.5;
      var curve = (1.5 - fixedTongueDiameter + this.gridOffset) * Math.cos(t);
      if (i == Tract.bladeStart - 2 || i == Tract.lipStart - 1) curve *= 0.8;
      if (i == Tract.bladeStart || i == Tract.lipStart - 2) curve *= 0.94;
      Tract.restDiameter[i] = 1.5 - curve;
    }
  }

  handleTouches() {
    if (this.tongueTouch != null && !this.tongueTouch.alive)
      this.tongueTouch = null;

    if (this.tongueTouch == null) {
      for (var j = 0; j < UI.touchesWithMouse.length; j++) {
        var touch = UI.touchesWithMouse[j];
        if (!touch.alive) continue;
        if (touch.fricative_intensity == 1) continue; //only new touches will pass this
        var x = touch.x;
        var y = touch.y;
        var index = TractUI.getIndex(x, y);
        var diameter = TractUI.getDiameter(x, y);
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
      var x = this.tongueTouch.x;
      var y = this.tongueTouch.y;
      var index = TractUI.getIndex(x, y);
      var diameter = TractUI.getDiameter(x, y);
      var fromPoint =
        (this.outerTongueControlRadius - diameter) /
        (this.outerTongueControlRadius - this.innerTongueControlRadius);
      fromPoint = Math.clamp(fromPoint, 0, 1);
      fromPoint =
        Math.pow(fromPoint, 0.58) - 0.2 * (fromPoint * fromPoint - fromPoint); //horrible kludge to fit curve to straight line
      this.tongueDiameter = Math.clamp(
        diameter,
        this.innerTongueControlRadius,
        this.outerTongueControlRadius
      );
      //this.tongueIndex = Math.clamp(index, this.tongueLowerIndexBound, this.tongueUpperIndexBound);
      var out =
        fromPoint *
        0.5 *
        (this.tongueUpperIndexBound - this.tongueLowerIndexBound);
      this.tongueIndex = Math.clamp(
        index,
        this.tongueIndexCentre - out,
        this.tongueIndexCentre + out
      );
    }

    this.setRestDiameter();
    for (var i = 0; i < Tract.n; i++)
      Tract.targetDiameter[i] = Tract.restDiameter[i];

    //other constrictions and nose
    Tract.velumTarget = 0.01;
    for (var j = 0; j < UI.touchesWithMouse.length; j++) {
      var touch = UI.touchesWithMouse[j];
      if (!touch.alive) continue;
      var x = touch.x;
      var y = touch.y;
      var index = TractUI.getIndex(x, y);
      var diameter = TractUI.getDiameter(x, y);
      if (index > Tract.noseStart && diameter < -this.noseOffset) {
        Tract.velumTarget = 0.4;
      }
      temp.a = index;
      temp.b = diameter;
      if (diameter < -0.85 - this.noseOffset) continue;
      diameter -= 0.3;
      if (diameter < 0) diameter = 0;
      var width = 2;
      if (index < 25) width = 10;
      else if (index >= Tract.tipStart) width = 5;
      else width = 10 - (5 * (index - 25)) / (Tract.tipStart - 25);
      if (
        index >= 2 &&
        index < Tract.n &&
        y < tractCanvas.height &&
        diameter < 3
      ) {
        let intIndex = Math.round(index);
        for (var i = -Math.ceil(width) - 1; i < width + 1; i++) {
          if (intIndex + i < 0 || intIndex + i >= Tract.n) continue;
          var relpos = intIndex + i - index;
          relpos = Math.abs(relpos) - 0.5;
          var shrink;
          if (relpos <= 0) shrink = 0;
          else if (relpos > width) shrink = 1;
          else shrink = 0.5 * (1 - Math.cos((Math.PI * relpos) / width));
          if (diameter < Tract.targetDiameter[intIndex + i]) {
            Tract.targetDiameter[intIndex + i] =
              diameter +
              (Tract.targetDiameter[intIndex + i] - diameter) * shrink;
          }
        }
      }
    }
  }
}
