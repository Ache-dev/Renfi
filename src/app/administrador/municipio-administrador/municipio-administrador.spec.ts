import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MunicipioAdministrador } from './municipio-administrador';

describe('MunicipioAdministrador', () => {
  let component: MunicipioAdministrador;
  let fixture: ComponentFixture<MunicipioAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [MunicipioAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MunicipioAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
