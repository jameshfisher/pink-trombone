import { nullButton } from "./Button";
import {
  audioSystem,
  CANVAS_SCALE,
  glottis,
  tractUI,
  ui,
  backCanvas,
  isFirefox,
  setAlwaysVoice,
  setAutoWobble,
  time,
  tractCanvas,
  tractCtx,
} from "./globals";
import { clamp } from "./math";

export class UI {
  width: number;
  top_margin: number;
  left_margin: number;
  inAboutScreen: boolean;
  inInstructionsScreen: boolean;
  instructionsLine: number;
  readonly debugText: string;
  readonly touchesWithMouse: TouchT[];
  mouseTouch: TouchT;
  mouseDown: boolean;
  readonly aboutButton: ButtonT;
  readonly alwaysVoiceButton: ButtonT;
  readonly autoWobbleButton: ButtonT;

  constructor() {
    this.width = 600;
    this.top_margin = 5;
    this.left_margin = 5;
    this.inAboutScreen = false;
    this.inInstructionsScreen = false;
    this.instructionsLine = 0;
    this.debugText = "";

    this.touchesWithMouse = [];
    this.mouseTouch = {
      id: 0,
      x: 0,
      y: 0,
      index: 0,
      diameter: 0,
      alive: false,
      startTime: 0,
      endTime: 0,
      fricative_intensity: 0,
    };
    this.mouseDown = false;

    this.aboutButton = nullButton(true);
    this.alwaysVoiceButton = nullButton(false);
    this.autoWobbleButton = nullButton(false);

    tractCanvas.addEventListener("touchstart", this.startTouches);
    tractCanvas.addEventListener("touchmove", this.moveTouches);
    tractCanvas.addEventListener("touchend", this.endTouches);
    tractCanvas.addEventListener("touchcancel", this.endTouches);

    document.addEventListener("touchstart", function (event) {
      event.preventDefault();
    });

    document.addEventListener("mousedown", (event) => {
      this.mouseDown = true;
      event.preventDefault();
      this.startMouse(event);
    });
    document.addEventListener("mouseup", (event) => {
      this.mouseDown = false;
      this.endMouse(event);
    });

    document.addEventListener("mousemove", this.moveMouse);
  }

  draw(this: UI) {
    this.alwaysVoiceButton.draw(tractCtx);
    this.autoWobbleButton.draw(tractCtx);
    this.aboutButton.draw(tractCtx);
    if (this.inAboutScreen) this.drawAboutScreen();
    else if (this.inInstructionsScreen) this.drawInstructionsScreen();
  }

  drawAboutScreen() {
    const ctx = tractCtx;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "white";
    ctx.rect(0, 0, CANVAS_SCALE * 600, CANVAS_SCALE * 600);
    ctx.fill();

    this.drawAboutText();
  }

  drawAboutText() {
    const ctx = tractCtx;
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#C070C6";
    ctx.strokeStyle = "#C070C6";
    ctx.font = "100px Quicksand";
    ctx.lineWidth = CANVAS_SCALE * 3;
    ctx.textAlign = "center";
    ctx.strokeText(
      "P i n k   T r o m b o n e",
      CANVAS_SCALE * 300,
      CANVAS_SCALE * 230
    );
    ctx.fillText(
      "P i n k   T r o m b o n e",
      CANVAS_SCALE * 300,
      CANVAS_SCALE * 230
    );

    ctx.font = "56px Quicksand";
    ctx.fillText(
      "bare-handed  speech synthesis",
      CANVAS_SCALE * 300,
      CANVAS_SCALE * 330
    );

    ctx.font = "40px Quicksand";
    //ctx.fillText("(tap to start)", 300, 380);

    if (isFirefox) {
      ctx.font = "40px Quicksand";
      ctx.fillText(
        "(sorry - may work poorly with the Firefox browser)",
        CANVAS_SCALE * 300,
        CANVAS_SCALE * 430
      );
    }
  }

  drawInstructionsScreen() {
    audioSystem.mute();
    const ctx = tractCtx;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "white";
    ctx.rect(0, 0, 600, 600);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#C070C6";
    ctx.strokeStyle = "#C070C6";
    ctx.font = "48px Quicksand";
    ctx.lineWidth = CANVAS_SCALE * 2;
    ctx.textAlign = "center";

    ctx.font = "38px Quicksand";
    ctx.textAlign = "left";
    this.instructionsLine = 0;
    this.write("Sound is generated in the glottis (at the bottom left) then ");
    this.write("filtered by the shape of the vocal tract. The voicebox ");
    this.write("controls the pitch and intensity of the initial sound.");
    this.write("");
    this.write("Then, to talk:");
    this.write("");
    this.write("- move the body of the tongue to shape vowels");
    this.write("");
    this.write(
      "- touch the oral cavity to narrow it, for fricative consonants"
    );
    this.write("");
    this.write(
      "- touch above the oral cavity to close it, for stop consonants"
    );
    this.write("");
    this.write("- touch the nasal cavity to open the velum and let sound ");
    this.write("   flow through the nose.");
    this.write("");
    this.write("");
    this.write("(tap anywhere to continue)");

    ctx.textAlign = "center";
    ctx.fillText("[tap here to RESET]", 470, 535);

    this.instructionsLine = 18.8;
    ctx.textAlign = "left";
    this.write("Pink Trombone v1.1");
    this.write("by Neil Thapen");
    ctx.fillStyle = "blue";
    ctx.globalAlpha = 0.6;
    this.write("venuspatrol.nfshost.com");

    /*ctx.beginPath();
          ctx.rect(35, 535, 230, 35);
          ctx.rect(370, 505, 200, 50);
          ctx.fill();*/

    ctx.globalAlpha = 1.0;
  }

  instructionsScreenHandleTouch(x: number, y: number) {
    if (x >= 35 && x <= 265 && y >= 535 && y <= 570)
      window.location.href = "http://venuspatrol.nfshost.com";
    else if (x >= 370 && x <= 570 && y >= 505 && y <= 555) location.reload();
    else {
      ui.inInstructionsScreen = false;
      ui.aboutButton.switchedOn = true;
      audioSystem.unmute();
    }
  }

  write(text: string) {
    tractCtx.fillText(
      text,
      CANVAS_SCALE * 50,
      CANVAS_SCALE * (100 + this.instructionsLine * 22)
    );
    this.instructionsLine += 1;
    if (text == "") this.instructionsLine -= 0.3;
  }

  buttonsHandleTouchStart(touch: unknown) {
    this.alwaysVoiceButton.handleTouchStart(touch);
    setAlwaysVoice(this.alwaysVoiceButton.switchedOn);
    this.autoWobbleButton.handleTouchStart(touch);
    setAutoWobble(this.autoWobbleButton.switchedOn);
    this.aboutButton.handleTouchStart(touch);
  }

  startTouches(event: TouchEvent) {
    event.preventDefault();
    if (!audioSystem.started) {
      audioSystem.started = true;
      audioSystem.startSound();
    }

    if (this.inAboutScreen) {
      ui.inAboutScreen = false;
      return;
    }

    if (this.inInstructionsScreen) {
      const touches = event.changedTouches;
      let x: number | undefined;
      let y: number | undefined;
      for (let j = 0; j < touches.length; j++) {
        x = ((touches[j].pageX - this.left_margin) / this.width) * 600;
        y = ((touches[j].pageY - this.top_margin) / this.width) * 600;
      }
      if (x && y) this.instructionsScreenHandleTouch(x, y);
      return;
    }

    const touches = event.changedTouches;
    for (let j = 0; j < touches.length; j++) {
      const x = ((touches[j].pageX - this.left_margin) / this.width) * 600;
      const y = ((touches[j].pageY - this.top_margin) / this.width) * 600;
      const touch: TouchT = {
        startTime: time,
        endTime: 0,
        fricative_intensity: 0,
        alive: true,
        id: touches[j].identifier,
        x: x,
        y: y,
        index: tractUI.getIndex(x, y),
        diameter: tractUI.getDiameter(x, y),
      };
      this.touchesWithMouse.push(touch);
      this.buttonsHandleTouchStart(touch);
    }

    this.handleTouches();
  }

  getTouchById(id: string | number) {
    for (let j = 0; j < ui.touchesWithMouse.length; j++) {
      if (ui.touchesWithMouse[j].id == id && ui.touchesWithMouse[j].alive)
        return ui.touchesWithMouse[j];
    }
    return null;
  }

  moveTouches(event: TouchEvent) {
    const touches = event.changedTouches;
    for (let j = 0; j < touches.length; j++) {
      const touch = ui.getTouchById(touches[j].identifier);
      if (touch !== null) {
        touch.x = ((touches[j].pageX - ui.left_margin) / ui.width) * 600;
        touch.y = ((touches[j].pageY - ui.top_margin) / ui.width) * 600;
        touch.index = tractUI.getIndex(touch.x, touch.y);
        touch.diameter = tractUI.getDiameter(touch.x, touch.y);
      }
    }
    this.handleTouches();
  }

  endTouches(event: TouchEvent) {
    const touches = event.changedTouches;
    for (let j = 0; j < touches.length; j++) {
      const touch = this.getTouchById(touches[j].identifier);
      if (touch !== null) {
        touch.alive = false;
        touch.endTime = time;
      }
    }
    ui.handleTouches();

    if (!ui.aboutButton.switchedOn) {
      ui.inInstructionsScreen = true;
    }
  }

  startMouse(event: MouseEvent) {
    if (!audioSystem.started) {
      audioSystem.started = true;
      audioSystem.startSound();
    }
    if (this.inAboutScreen) {
      ui.inAboutScreen = false;
      return;
    }
    if (this.inInstructionsScreen) {
      const x = ((event.pageX - tractCanvas.offsetLeft) / ui.width) * 600;
      const y = ((event.pageY - tractCanvas.offsetTop) / ui.width) * 600;
      ui.instructionsScreenHandleTouch(x, y);
      return;
    }

    const x = ((event.pageX - tractCanvas.offsetLeft) / ui.width) * 600;
    const y = ((event.pageY - tractCanvas.offsetTop) / ui.width) * 600;
    const touch: TouchT = {
      startTime: time,
      fricative_intensity: 0,
      endTime: 0,
      alive: true,
      id: "mouse" + Math.random(),
      x: x,
      y: y,
      index: tractUI.getIndex(x, y),
      diameter: tractUI.getDiameter(x, y),
    };

    this.mouseTouch = touch;
    this.touchesWithMouse.push(touch);
    this.buttonsHandleTouchStart(touch);
    this.handleTouches();
  }

  moveMouse(event: MouseEvent) {
    const touch = ui.mouseTouch;
    if (!touch.alive) return;
    touch.x = ((event.pageX - tractCanvas.offsetLeft) / ui.width) * 600;
    touch.y = ((event.pageY - tractCanvas.offsetTop) / ui.width) * 600;
    touch.index = tractUI.getIndex(touch.x, touch.y);
    touch.diameter = tractUI.getDiameter(touch.x, touch.y);
    ui.handleTouches();
  }

  endMouse(_event: MouseEvent) {
    const touch = ui.mouseTouch;
    if (!touch.alive) return;
    touch.alive = false;
    touch.endTime = time;
    ui.handleTouches();

    if (!ui.aboutButton.switchedOn) ui.inInstructionsScreen = true;
  }

  handleTouches() {
    tractUI.handleTouches();
    glottis.handleTouches();
  }

  updateTouches() {
    const fricativeAttackTime = 0.1;
    for (let j = this.touchesWithMouse.length - 1; j >= 0; j--) {
      const touch = this.touchesWithMouse[j];
      if (!touch.alive && time > touch.endTime + 1) {
        this.touchesWithMouse.splice(j, 1);
      } else if (touch.alive) {
        touch.fricative_intensity = clamp(
          (time - touch.startTime) / fricativeAttackTime,
          0,
          1
        );
      } else {
        touch.fricative_intensity = clamp(
          1 - (time - touch.endTime) / fricativeAttackTime,
          0,
          1
        );
      }
    }
  }

  shapeToFitScreen() {
    if (window.innerWidth <= window.innerHeight) {
      this.width = window.innerWidth - 80;
      this.left_margin = 40;
      this.top_margin = 0.5 * (window.innerHeight - this.width);
    } else {
      this.width = window.innerHeight - 80;
      this.left_margin = 0.5 * (window.innerWidth - this.width);
      this.top_margin = 40;
    }

    document.body.style.marginLeft = this.left_margin + "px";
    document.body.style.marginTop = this.top_margin + "px";
    tractCanvas.style.width = this.width + "px";
    backCanvas.style.width = this.width + "px";
  }
}
