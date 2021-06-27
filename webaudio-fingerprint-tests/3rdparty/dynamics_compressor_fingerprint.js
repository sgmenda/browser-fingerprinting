// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//
// Computes the DynamicsCompressor fingerprint and sends it back to the test via
// `sendValueToTest`.

async function computeFingerprint() {
  const context = new OfflineAudioContext({
    numberOfChannels: 1,
    length: 44100,
    sampleRate: 44100,
  });
  if (!context) return 0.0;
  const oscillator = new OscillatorNode(context);
  const compressor = new DynamicsCompressorNode(context);
  // For this test, it's ok to mix the stereo compressor output to mono for the
  // final result.
  oscillator.connect(compressor).connect(context.destination);
  oscillator.start(0);
  const renderedBuffer = await context.startRendering();
  const chanData = renderedBuffer.getChannelData(0);
  let result = 0;
  for (const elem of chanData) {
    result += elem;
  }
  return result;
}

window.addEventListener("load", async () => {
  const fingerprint = await computeFingerprint();
  const fpHarcoded = 13.130926895706125; /* from https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/webaudio/webaudio_browsertest.cc;l=61 */

  let x = document.getElementById("DynamicsCompressor-fp-value");
  x.innerText = fingerprint;

  let y = document.getElementById("DynamicsCompressor-fp-hardcoded");
  y.innerText = fpHarcoded;

  let z = document.getElementById("DynamicsCompressor-fp-diff");
  z.innerText = fpHarcoded - fingerprint;
  if (z.innerText == "0") {
    z.style.color = "#11ee73";
  } else {
    z.style.color = "#d62943";
  }
});
