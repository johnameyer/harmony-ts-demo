import { Component } from '@angular/core';
import { SolutionRendererComponent } from './solution-renderer/solution-renderer.component';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { scan } from 'rxjs';
import { SolverService } from './solver/solver.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'harmony-ts-demo-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [SolutionRendererComponent, ReactiveFormsModule, AsyncPipe]
})
export class AppComponent {
  params = new FormGroup({
    key: new FormControl('C', {nonNullable: true}),
    numerals: new FormControl('I V64 I6 IV ii65 I64 V I', {nonNullable: true}),
    soprano: new FormControl('', {nonNullable: true}),
    spacing: new FormControl('', {nonNullable: true}),
    useProgressions: new FormControl(false, {nonNullable: true}),
    canModulate: new FormControl(false, {nonNullable: true}),
    endCadence: new FormControl('', {nonNullable: true}),
    search: new FormControl('default', {nonNullable: true}),
  });
  
  samples: (typeof this.params['value'])[] = [
    { key: 'D', numerals: 'I vi I6 viio65/ii ii ii65 I64 V7 I'}, 
    { key: 'Fm', numerals: 'i viio7 i iio6 i64 viio7/V i64 V7 i'},
    { key: 'Bbm', numerals: 'i ii042 V65 i iv6 V IV6 V65 i'},
    { key: 'Db', numerals: 'I IV65 viio iii65 vi ii65 I64 V I'},
    { key: 'Dm', numerals: 'i iv43 VII7 III43 VI7 ii043 V7 VI viio7/V i64 V7 i'},
    { key: 'C#', numerals: 'I IV6 V6 I iii IV V42 I6 V7/ii ii V I'},
    { key: 'G', numerals: 'I IV I6 viio6 I ii6 I64 V V42 I6 vi ii65 V V65/V V V', spacing: 'G4 D4 B3 G2'},
    { key: 'Bm', numerals: 'i viio65 i6 iv i ii042 V6 i i6 V65/iv iv V65/V i64 V7 i'},
    { key: 'Dm', numerals: 'i iv65 VII III65 VI ii065 i64 V'}, // sequence
    { key: 'C#m', numerals: 'i v6 VI III6 iv viio7/V i64 V'}, // sequence
  ];
  
  selectSample(element: HTMLSelectElement) {
    this.params.reset();
    this.params.patchValue(this.samples[element.value]);

    return false;
  }
  
  // V7/ii ii7
  
  protected noWebworker = typeof Worker === 'undefined';
  
  constructor(protected solver: SolverService) { }
  
  results = this.solver.getResults().pipe(scan((acc, val) => [val, ...acc.slice()], []));
  
  submit() {
    const values = this.params.getRawValue();
    
    const numerals = values.numerals.split(' ');
    const soprano = values.soprano.split(' ');
    const [key, minor] = values.key.split('m');
    numerals[0] = numerals[0]?.length ? numerals[0] : (minor === undefined ? 'I' : 'i');
    
    this.solver.solve({ ...values, numerals, soprano, key, minor });
    
    return false;
  }
  
  stop() {
    this.solver.stop();
    return false;
  }
}