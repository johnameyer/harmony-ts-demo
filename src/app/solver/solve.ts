import { Scale, Key, IncompleteChord, RomanNumeral, AbsoluteNote, Harmonizer, PartWritingParameters, defaultPartWritingParameters, PartWriterParameters, PartWriter, flattenResult, CompleteChord, Note } from "harmony-ts";

export interface Params {
    key: string;
    minor: string;
    numerals: string[];
    soprano: string[];
    bass: string[];
    endCadence?: string;
    canModulate: boolean;
    useProgressions: boolean;
    spacing: string;
    search: string;
}

function noteFromString(note: string) {
  if(note.match("[0-9]")) {
    return AbsoluteNote.fromString(note);
  }
  return Note.fromString(note);
}

export function solve({ key, minor, numerals, soprano, bass, canModulate, useProgressions, spacing, endCadence, search }: Params) {
    const scale = [Key.fromString(key), minor === undefined ? Scale.Quality.MAJOR : Scale.Quality.MINOR] as Scale;
    const constraints = new Array(Math.max(numerals.length, soprano.length, bass.length)).fill(0)
      .map((_, i) => new IncompleteChord({ romanNumeral: numerals[i] ? RomanNumeral.fromString(numerals[i], scale) : undefined, voices: [soprano[i] ? noteFromString(soprano[i]) : undefined, undefined, undefined, bass[i] ? noteFromString(bass[i]) : undefined] }));
    if (spacing) {
      constraints[0] = new IncompleteChord({ romanNumeral: RomanNumeral.fromString(numerals[0], scale), voices: spacing.split(' ').map(note => noteFromString(note)) });
    }
    if (endCadence) {
      constraints[constraints.length - 1].flags[endCadence] = true;
    }
  
    const harmonizer = new Harmonizer({ canModulate, useProgressions });
    const params: PartWritingParameters = defaultPartWritingParameters;
    const yieldOrdering = {
      default: PartWriterParameters.defaultOrdering,
      depth: PartWriterParameters.depthOrdering,
      greedy: PartWriterParameters.greedyOrdering
    }[search];
    const iterator = new PartWriter({ yieldOrdering }, params, harmonizer).voiceAll(constraints, scale);
  
    const result = flattenResult(iterator).next().value as CompleteChord[];
    return result;
  }