import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbsoluteNote, IncompleteChord, Scale, Harmonizer, RomanNumeral, Key, PartWritingParameters, PartWriterParameters, defaultPartWritingParameters, PartWriter, flattenResult } from 'harmony-ts';
import { CompleteChord } from 'harmony-ts/dist/chord/complete-chord';
import { Params, solve } from './solve';

let worker = new Worker(new URL('./app.worker', import.meta.url), { type: 'module' });

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
  @ViewChild('canModulate') canModulate: ElementRef;
  @ViewChild('endCadence') endCadence: ElementRef;
  @ViewChild('search') search: ElementRef;
  @ViewChild('error') error: ElementRef;
  running: boolean = false;
  hasWebworker = !!worker;

  current: any;

  stop() {
    worker.terminate();
    worker = new Worker(new URL('./app.worker', import.meta.url), { type: 'module' });
    this.running = false;
  }

  submit(): false {
    setTimeout(async () => {
      try {
        const numerals = this.chords.nativeElement.value.split(' ');
        const soprano = this.soprano.nativeElement.value.split(' ');
        const [key, minor] = this.key.nativeElement.value.split('m');
        numerals[0] = numerals[0]?.length ? numerals[0] : (minor === undefined ? 'I' : 'i');
        const canModulate = this.canModulate.nativeElement.checked;
        const useProgressions = this.useProgressions.nativeElement.checked;
        const endCadence = this.endCadence.nativeElement.value;
        const spacing = this.spacing.nativeElement.value;
        const search = this.search.nativeElement.value;

        this.running = true;
        this.error.nativeElement.innerHTML = '';
        const result = await solveAsync({ key, minor, numerals, soprano, canModulate, useProgressions, endCadence, spacing, search });// const result = Harmony.harmonizeAll(params);
        this.running = false;

        if (result) {
          console.log(result.map(chord => chord.romanNumeral.scale));
          this.error.nativeElement.innerHTML = '';
          this.results.push(result);
        } else {
          this.error.nativeElement.innerHTML = 'Could not find solution';
        }
      } catch (e) {
        this.error.nativeElement.innerHTML = 'Error: ' + e;
        this.running = false;
      }
    }, 0);
    return false;
  }
}

async function solveAsync(params: Params) {
  if (typeof Worker !== 'undefined') {
    return new Promise<ReturnType<typeof solve>>((resolve, reject) => {
      worker.onmessage = ({ data }) => {
        if(!data.error) {
          resolve(data.result?.map(chord => new CompleteChord(chord.voices.map(AbsoluteNote.fromString), RomanNumeral.fromString(chord.romanNumeral, chord.scale), chord.flags)));
        } else {
          reject(data.error);
        }
      };
      worker.postMessage(params);
    })
  } else {
    // Web Workers are not supported in this environment.
    return solve(params);
  }
}