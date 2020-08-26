import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbsoluteNote, IncompleteChord, Scale, Harmonizer, RomanNumeral, Key, PartWritingParameters, defaultPartWritingParameters, PartWriter, flattenResults } from 'harmony-ts';
import { CompleteChord } from 'harmony-ts/dist/chord/complete-chord';

@Component({
  selector: 'harmony-ts-demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  results: CompleteChord[][] = [];
  @ViewChild('key') key: ElementRef;
  @ViewChild('chords') chords: ElementRef;
  @ViewChild('soprano') soprano: ElementRef;
  @ViewChild('spacing') spacing: ElementRef;
  @ViewChild('useProgressions') useProgressions: ElementRef;
  @ViewChild('endCadence') endCadence: ElementRef;
  @ViewChild('error') error: ElementRef;

  current: any;

  submit(): false {
    setTimeout(() => {
      try {
        const numerals = this.chords.nativeElement.value.split(' ');
        const soprano = this.soprano.nativeElement.value.split(' ');
        const [key, minor] = this.key.nativeElement.value.split('m');
        numerals[0] = numerals[0]?.length ? numerals[0] : (minor === undefined ? 'I' : 'i');
        const scale = [Key.fromString(key), minor === undefined ? Scale.Quality.MAJOR : Scale.Quality.MINOR] as Scale;
        const constraints = new Array(Math.max(numerals.length, soprano.length)).fill(0)
          .map((_, i) => new IncompleteChord({romanNumeral: numerals[i] ? new RomanNumeral(numerals[i], scale) : undefined, voices: soprano[i] ? [new AbsoluteNote(soprano[i]), undefined, undefined, undefined] : undefined}));
        if(this.spacing.nativeElement.value) {
          constraints[0] = new IncompleteChord({romanNumeral: new RomanNumeral(numerals[0], scale), voices: this.spacing.nativeElement.value.split(' ').map(note => new AbsoluteNote(note))});
        }
        if(this.endCadence.nativeElement.value) {
          constraints[constraints.length - 1].flags[this.endCadence.nativeElement.value] = true;
        }

        const harmonizer = new Harmonizer({ canModulate: true, useProgressions: this.useProgressions.nativeElement.checked });
        const params: PartWritingParameters = defaultPartWritingParameters;
        const iterator = new PartWriter(undefined, params, harmonizer).voiceAll(constraints, scale);

        const result = flattenResults(iterator).next().value as CompleteChord[];// const result = Harmony.harmonizeAll(params);

        if (result) {
          console.log(result.map(chord => chord.romanNumeral.scale));
          this.error.nativeElement.innerHTML = '';
          this.results.push(result);
        } else {
          this.error.nativeElement.innerHTML = 'Could not find solution';
        }
      } catch (e) {
        this.error.nativeElement.innerHTML = 'Error: ' + e;
      }
    }, 0);
    return false;
  }
}
