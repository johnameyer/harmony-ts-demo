import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { Params, solve } from './solve';
import { CompleteChord, AbsoluteNote, RomanNumeral, HarmonizedChord } from 'harmony-ts';

const getWorker = () => new Worker(new URL('../app.worker', import.meta.url), { type: 'module' });

@Injectable({
  providedIn: 'root'
})
export class SolverService {

  private runningStatus = new BehaviorSubject<boolean>(false);
  private results = new Subject<CompleteChord[]>();
  private error = new Subject<string>();

  worker = getWorker();

  stop() {
    this.worker.terminate();
    this.worker = getWorker();
    this.runningStatus.next(false);
  }

  constructor() {
    this.runningStatus.pipe(tap(console.log));
  }

  isRunning(): Observable<boolean> {
    return this.runningStatus;
  }

  getResults(): Observable<CompleteChord[]> {
    return this.results;
  }

  getError(): Observable<string> {
    return this.error;
  }

  solve(params: Params) {
    console.log(params);
    setTimeout(() => {
      this.invokeWebWorkerOrRun(params)
    }, 0);
  }

  wrap(fun: () => CompleteChord[]) {
    try {
      const result = fun();

      if (result) {
        this.results.next(result);
      } else {
        this.error.next('Could not find solution');
      }
    } catch (e) {
      this.error.next('Error: ' + e);
    } finally {
      this.runningStatus.next(false);
    }
  }

  invokeWebWorkerOrRun(params: Params) {
    this.error.next('');
    this.runningStatus.next(true);

    if (typeof Worker !== 'undefined') {
      this.worker.onmessage = ({ data }) => (this.wrap(() => {
        if(!data.error) {
          return data.result?.map(chord => new CompleteChord(chord.voices.map(AbsoluteNote.fromString), RomanNumeral.fromString(chord.romanNumeral, chord.scale), chord.flags));
        } else {
          throw data.error;
        }
      }));
      this.worker.postMessage(params);
    } else {
      // Web Workers are not supported in this environment.
      this.wrap(() => solve(params));
    }
  }
}
