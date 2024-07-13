import { TestBed } from '@angular/core/testing';

import { SolverService } from './solver.service';

describe('SolverService', () => {
  let service: SolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
