/// <reference lib="webworker" />

import { solve } from "./solver/solve";

addEventListener('message', ({ data }) => {
  try {
    postMessage({result: solve(data)?.map(chord => ({
      voices: chord.voices.map(voice => voice.name),
      romanNumeral: chord.romanNumeral.name,
      scale: chord.romanNumeral.scale,
      flags: chord.flags
    }))});
  } catch (error) {
    postMessage({error});
  }
});
