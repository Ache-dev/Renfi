import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UsuarioAdministrador } from './usuario-administrador';

describe('UsuarioAdministrador', () => {
  let component: UsuarioAdministrador;
  let fixture: ComponentFixture<UsuarioAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [UsuarioAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
