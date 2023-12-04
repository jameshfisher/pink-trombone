import { nullButton } from "./Button";
import {
  AudioSystem,
  Glottis,
  TractUI,
  UI,
  backCanvas,
  isFirefox,
  setAlwaysVoice,
  setAutoWobble,
  time,
  tractCanvas,
  tractCtx,
} from "./globals";

export class UIClass {
  width: number;
  top_margin: number;
  left_margin: number;
  inAboutScreen: boolean;
  inInstructionsScreen: boolean;
  instructionsLine: number;
  debugText: string;
  touchesWithMouse: TouchT[];
  mouseTouch: TouchT;
  mouseDown: boolean;
  aboutButton: ButtonT;
  alwaysVoiceButton: ButtonT;
  autoWobbleButton: ButtonT;

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

  draw(this: UIClass) {
    this.alwaysVoiceButton.draw(tractCtx);
    this.autoWobbleButton.draw(tractCtx);
    this.aboutButton.draw(tractCtx);
    if (this.inAboutScreen) this.drawAboutScreen();
    else if (this.inInstructionsScreen) this.drawInstructionsScreen();
  }

  drawAboutScreen() {
    var ctx = tractCtx;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = "white";
    ctx.rect(0, 0, 600, 600);
    ctx.fill();

    this.drawAboutText();
  }

  drawAboutText() {
    var ctx = tractCtx;
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#C070C6";
    ctx.strokeStyle = "#C070C6";
    ctx.font = "50px Quicksand";
    ctx.lineWidth = 3;
    ctx.textAlign = "center";
    ctx.strokeText("P i n k   T r o m b o n e", 300, 230);
    ctx.fillText("P i n k   T r o m b o n e", 300, 230);

    ctx.font = "28px Quicksand";
    ctx.fillText("bare-handed  speech synthesis", 300, 330);

    ctx.font = "20px Quicksand";
    //ctx.fillText("(tap to start)", 300, 380);

    if (isFirefox) {
      ctx.font = "20px Quicksand";
      ctx.fillText(
        "(sorry - may work poorly with the Firefox browser)",
        300,
        430
      );
    }
  }

  drawInstructionsScreen(this: any) {
    AudioSystem.mute();
    var ctx = tractCtx;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "white";
    ctx.rect(0, 0, 600, 600);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#C070C6";
    ctx.strokeStyle = "#C070C6";
    ctx.font = "24px Quicksand";
    ctx.lineWidth = 2;
    ctx.textAlign = "center";

    ctx.font = "19px Quicksand";
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
      UI.inInstructionsScreen = false;
      UI.aboutButton.switchedOn = true;
      AudioSystem.unmute();
    }
  }

  write(text: string) {
    tractCtx.fillText(text, 50, 100 + this.instructionsLine * 22);
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
    if (!AudioSystem.started) {
      AudioSystem.started = true;
      AudioSystem.startSound();
    }

    if (this.inAboutScreen) {
      UI.inAboutScreen = false;
      return;
    }

    if (this.inInstructionsScreen) {
      var touches = event.changedTouches;
      let x: number | undefined;
      let y: number | undefined;
      for (var j = 0; j < touches.length; j++) {
        x = ((touches[j].pageX - this.left_margin) / this.width) * 600;
        y = ((touches[j].pageY - this.top_margin) / this.width) * 600;
      }
      if (x && y) this.instructionsScreenHandleTouch(x, y);
      return;
    }

    var touches = event.changedTouches;
    for (var j = 0; j < touches.length; j++) {
      const x = ((touches[j].pageX - this.left_margin) / this.width) * 600;
      const y = ((touches[j].pageY - this.top_margin) / this.width) * 600;
      var touch: TouchT = {
        startTime: time,
        endTime: 0,
        fricative_intensity: 0,
        alive: true,
        id: touches[j].identifier,
        x: x,
        y: y,
        index: TractUI.getIndex(x, y),
        diameter: TractUI.getDiameter(x, y),
      };
      this.touchesWithMouse.push(touch);
      this.buttonsHandleTouchStart(touch);
    }

    this.handleTouches();
  }

  getTouchById(id: unknown) {
    for (var j = 0; j < UI.touchesWithMouse.length; j++) {
      if (UI.touchesWithMouse[j].id == id && UI.touchesWithMouse[j].alive)
        return UI.touchesWithMouse[j];
    }
    return null;
  }

  moveTouches(event: TouchEvent) {
    var touches = event.changedTouches;
    for (var j = 0; j < touches.length; j++) {
      var touch = UI.getTouchById(touches[j].identifier);
      if (touch !== null) {
        touch.x = ((touches[j].pageX - UI.left_margin) / UI.width) * 600;
        touch.y = ((touches[j].pageY - UI.top_margin) / UI.width) * 600;
        touch.index = TractUI.getIndex(touch.x, touch.y);
        touch.diameter = TractUI.getDiameter(touch.x, touch.y);
      }
    }
    this.handleTouches();
  }

  endTouches(event: TouchEvent) {
    var touches = event.changedTouches;
    for (var j = 0; j < touches.length; j++) {
      var touch = this.getTouchById(touches[j].identifier);
      if (touch !== null) {
        touch.alive = false;
        touch.endTime = time;
      }
    }
    UI.handleTouches();

    if (!UI.aboutButton.switchedOn) {
      UI.inInstructionsScreen = true;
    }
  }

  startMouse(event: MouseEvent) {
    if (!AudioSystem.started) {
      AudioSystem.started = true;
      AudioSystem.startSound();
    }
    if (this.inAboutScreen) {
      UI.inAboutScreen = false;
      return;
    }
    if (this.inInstructionsScreen) {
      let x = ((event.pageX - tractCanvas.offsetLeft) / UI.width) * 600;
      let y = ((event.pageY - tractCanvas.offsetTop) / UI.width) * 600;
      UI.instructionsScreenHandleTouch(x, y);
      return;
    }

    const x = ((event.pageX - tractCanvas.offsetLeft) / UI.width) * 600;
    const y = ((event.pageY - tractCanvas.offsetTop) / UI.width) * 600;
    var touch: TouchT = {
      startTime: time,
      fricative_intensity: 0,
      endTime: 0,
      alive: true,
      id: "mouse" + Math.random(),
      x: x,
      y: y,
      index: TractUI.getIndex(x, y),
      diameter: TractUI.getDiameter(x, y),
    };

    this.mouseTouch = touch;
    this.touchesWithMouse.push(touch);
    this.buttonsHandleTouchStart(touch);
    this.handleTouches();
  }

  moveMouse(event: MouseEvent) {
    var touch = UI.mouseTouch;
    if (!touch.alive) return;
    touch.x = ((event.pageX - tractCanvas.offsetLeft) / UI.width) * 600;
    touch.y = ((event.pageY - tractCanvas.offsetTop) / UI.width) * 600;
    touch.index = TractUI.getIndex(touch.x, touch.y);
    touch.diameter = TractUI.getDiameter(touch.x, touch.y);
    UI.handleTouches();
  }

  endMouse(event: MouseEvent) {
    var touch = UI.mouseTouch;
    if (!touch.alive) return;
    touch.alive = false;
    touch.endTime = time;
    UI.handleTouches();

    if (!UI.aboutButton.switchedOn) UI.inInstructionsScreen = true;
  }

  handleTouches() {
    TractUI.handleTouches();
    Glottis.handleTouches();
  }

  updateTouches() {
    var fricativeAttackTime = 0.1;
    for (var j = this.touchesWithMouse.length - 1; j >= 0; j--) {
      var touch = this.touchesWithMouse[j];
      if (!touch.alive && time > touch.endTime + 1) {
        this.touchesWithMouse.splice(j, 1);
      } else if (touch.alive) {
        touch.fricative_intensity = Math.clamp(
          (time - touch.startTime) / fricativeAttackTime,
          0,
          1
        );
      } else {
        touch.fricative_intensity = Math.clamp(
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
