import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FincasRelevantesComponent } from './fincas-relevantes-component';

describe('FincasRelevantesComponent', () => {
  let component: FincasRelevantesComponent;
  let fixture: ComponentFixture<FincasRelevantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FincasRelevantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FincasRelevantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
