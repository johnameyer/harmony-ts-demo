import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionRendererComponent } from './solution-renderer.component';

describe('SolutionRendererComponent', () => {
  let component: SolutionRendererComponent;
  let fixture: ComponentFixture<SolutionRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
