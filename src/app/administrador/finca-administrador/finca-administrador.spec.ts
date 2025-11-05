import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FincaAdministrador } from './finca-administrador';

describe('FincaAdministrador', () => {
  let component: FincaAdministrador;
  let fixture: ComponentFixture<FincaAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FincaAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FincaAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
