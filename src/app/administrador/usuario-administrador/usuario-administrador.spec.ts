import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioAdministrador } from './usuario-administrador';

describe('UsuarioAdministrador', () => {
  let component: UsuarioAdministrador;
  let fixture: ComponentFixture<UsuarioAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
