import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbsoluteNote, IncompleteChord, Scale, Harmony, HarmonizedChord, RomanNumeral } from 'harmony-ts';

@Component({
  selector: 'harmony-ts-demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  results: HarmonizedChord[][] = [];
  @ViewChild('key') key: ElementRef;
  @ViewChild('chords') chords: ElementRef;
  @ViewChild('soprano') soprano: ElementRef;
  @ViewChild('spacing') spacing: ElementRef;
  @ViewChild('useProgressions') useProgressions: ElementRef;
  @ViewChild('error') error: ElementRef;

  current: any;

  submit(): false {
    setTimeout(() => {
      const numerals = this.chords.nativeElement.value.split(' ');
      const soprano = this.soprano.nativeElement.value.split(' ');
      const [key, minor] = this.key.nativeElement.value.split('m');
      numerals[0] = numerals[0] ?? (minor !== undefined ? 'I' : 'i');
      const scale = minor === undefined ? Scale.transpose(Scale.Major.notes, key) : Scale.transpose(Scale.NaturalMinor.notes, key);
      const constraints = new Array(Math.max(numerals.length, soprano.length)).fill(0)
        .map((_, i) => new IncompleteChord({romanNumeral: numerals[i] ? new RomanNumeral(numerals[i], scale) : undefined, voices: soprano[i] ? [new AbsoluteNote(soprano[i]), undefined, undefined, undefined] : undefined}));
      if(this.spacing.nativeElement.value) {
        constraints[0] = new IncompleteChord({romanNumeral: new RomanNumeral(numerals[0], scale), voices: this.spacing.nativeElement.value.split(' ').map(note => new AbsoluteNote(note))});
      }
      const start = numerals[0];
      const result = Harmony.harmonizeAll({scale, start, constraints, greedy: false, useProgressions: this.useProgressions.nativeElement.checked});

      if (result.solution) {
        this.error.nativeElement.innerHTML = '';
        this.results.push(result.solution);
      } else {
        this.error.nativeElement.innerHTML = 'Could not find solution for ' + numerals + ' got to ' + numerals[result.furthest] + ' @ ' + result.furthest;
      }
    }, 0);
    return false;
  }
}
