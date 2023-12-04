import * as IMAGINARY from "./i18n";
import { AudioSystemClass } from "./AudioSystem";
import { GlottisClass } from "./Glottis";
import { TractClass } from "./Tract";
import { TractUIClass } from "./TractUI";
import { UIClass } from "./UI";
import FontFaceObserver from "fontfaceobserver";

import {
  TractUI,
  UI,
  setAudioSystem,
  setBackCanvas,
  setBackCtx,
  setGlottis,
  setTime,
  setTract,
  setTractCanvas,
  setTractCtx,
  setTractUI,
  setUI,
} from "./globals";

export function start(
  backCanvas: HTMLCanvasElement,
  tractCanvas: HTMLCanvasElement
) {
  setBackCanvas(backCanvas);
  setBackCtx(backCanvas.getContext("2d")!);
  setTractCanvas(tractCanvas);
  setTractCtx(tractCanvas.getContext("2d")!);

  document.body.style.cursor = "pointer";

  setAudioSystem(new AudioSystemClass());
  setUI(new UIClass());
  setGlottis(new GlottisClass());
  setTract(new TractClass());
  setTractUI(new TractUIClass());

  requestAnimationFrame(redraw);
  function redraw(highResTimestamp: DOMHighResTimeStamp) {
    UI.shapeToFitScreen();
    TractUI.draw();
    UI.draw();
    requestAnimationFrame(redraw);
    setTime(Date.now() / 1000);
    UI.updateTouches();
  }

  addLanguageSwitcher();
}

function addLanguageSwitcher() {
  var code = "";
  var name = "";
  if (IMAGINARY.i18n.getLang() === "en") {
    code = "de";
    name = "Deutsch";
  } else {
    code = "en";
    name = "English";
  }

  const a = document.createElement("a");
  a.href = "index.html?lang=" + code;
  a.classList.add("language-switcher");
  a.textContent = name;
}

IMAGINARY.i18n
  .init({
    queryStringVariable: "lang",
    translationsDirectory: "tr",
    defaultLanguage: "en",
  })
  .then(function () {
    return Promise.all([
      new FontFaceObserver("Quicksand", { weight: 400 }).load(),
      new FontFaceObserver("Quicksand", { weight: 700 }).load(),
    ]);
  });
