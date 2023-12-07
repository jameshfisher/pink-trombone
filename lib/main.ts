import * as IMAGINARY from "./i18n";
import { AudioSystem } from "./AudioSystem";
import { Glottis } from "./Glottis";
import { Tract } from "./Tract";
import { TractUI } from "./TractUI";
import { UI } from "./UI";
import FontFaceObserver from "fontfaceobserver";

import {
  tractUI,
  ui,
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

  setAudioSystem(new AudioSystem());
  setUI(new UI());
  setGlottis(new Glottis());
  setTract(new Tract());
  setTractUI(new TractUI());

  requestAnimationFrame(redraw);
  function redraw() {
    ui.shapeToFitScreen();
    tractUI.draw();
    ui.draw();
    requestAnimationFrame(redraw);
    setTime(Date.now() / 1000);
    ui.updateTouches();
  }

  addLanguageSwitcher();
}

function addLanguageSwitcher() {
  let code = "";
  let name = "";
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
