import { glottis, tract, sampleRate, setSampleRate } from "./globals";

// blockLength Can be set to 512 for more responsiveness but
// potential crackling if CPU can't fill the buffer fast enough (latency)
const blockLength = 2048;

function doScriptProcessor(event: AudioProcessingEvent) {
  const inputArray1 = event.inputBuffer.getChannelData(0);
  const inputArray2 = event.inputBuffer.getChannelData(1);
  const outArray = event.outputBuffer.getChannelData(0);
  for (let j = 0, N = outArray.length; j < N; j++) {
    const lambda1 = j / N;
    const lambda2 = (j + 0.5) / N;
    const glottalOutput = glottis.runStep(lambda1, inputArray1[j]);

    let vocalOutput = 0;
    //Tract runs at twice the sample rate
    tract.runStep(glottalOutput, inputArray2[j], lambda1);
    vocalOutput += tract.lipOutput + tract.noseOutput;
    tract.runStep(glottalOutput, inputArray2[j], lambda2);
    vocalOutput += tract.lipOutput + tract.noseOutput;
    outArray[j] = vocalOutput * 0.125;
  }
  glottis.finishBlock();
  tract.finishBlock();
}

export class AudioSystem {
  started: boolean;
  blockTime: number;
  audioContext: AudioContext;
  scriptProcessor?: ScriptProcessorNode;

  constructor() {
    this.started = false;

    this.audioContext = new window.AudioContext();
    setSampleRate(this.audioContext.sampleRate);

    this.blockTime = blockLength / sampleRate;
  }

  startSound() {
    //scriptProcessor may need a dummy input channel on iOS
    this.scriptProcessor = this.audioContext.createScriptProcessor(
      blockLength,
      2,
      1
    );
    this.scriptProcessor.onaudioprocess = doScriptProcessor;
    this.scriptProcessor.connect(this.audioContext.destination);

    const whiteNoise = this.createWhiteNoiseNode(2 * sampleRate); // 2 seconds of noise

    const aspirateFilter = this.audioContext.createBiquadFilter();
    aspirateFilter.type = "bandpass";
    aspirateFilter.frequency.value = 500;
    aspirateFilter.Q.value = 0.5;
    whiteNoise.connect(aspirateFilter);
    aspirateFilter.connect(this.scriptProcessor);

    const fricativeFilter = this.audioContext.createBiquadFilter();
    fricativeFilter.type = "bandpass";
    fricativeFilter.frequency.value = 1000;
    fricativeFilter.Q.value = 0.5;
    whiteNoise.connect(fricativeFilter);
    fricativeFilter.connect(this.scriptProcessor);

    whiteNoise.start(0);
  }

  createWhiteNoiseNode(frameCount: number) {
    const myArrayBuffer = this.audioContext.createBuffer(
      1,
      frameCount,
      sampleRate
    );

    const nowBuffering = myArrayBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      nowBuffering[i] = Math.random(); // gaussian();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = myArrayBuffer;
    source.loop = true;

    return source;
  }

  mute() {
    this.scriptProcessor?.disconnect();
  }

  unmute() {
    this.scriptProcessor?.connect(this.audioContext.destination);
  }
}
