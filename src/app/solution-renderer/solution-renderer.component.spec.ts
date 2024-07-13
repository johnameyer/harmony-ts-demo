import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SolutionRendererComponent } from './solution-renderer.component';

describe('SolutionRendererComponent', () => {
  let component: SolutionRendererComponent;
  let fixture: ComponentFixture<SolutionRendererComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [SolutionRendererComponent]
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
