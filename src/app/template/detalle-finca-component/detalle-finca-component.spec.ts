import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleFincaComponent } from './detalle-finca-component';

describe('DetalleFincaComponent', () => {
  let component: DetalleFincaComponent;
  let fixture: ComponentFixture<DetalleFincaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetalleFincaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleFincaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
