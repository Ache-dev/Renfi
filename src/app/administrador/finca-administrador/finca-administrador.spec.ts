import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FincaAdministrador } from './finca-administrador';

describe('FincaAdministrador', () => {
  let component: FincaAdministrador;
  let fixture: ComponentFixture<FincaAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
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
