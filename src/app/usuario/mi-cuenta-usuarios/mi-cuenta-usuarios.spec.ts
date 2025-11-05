import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiCuentaUsuarios } from './mi-cuenta-usuarios';

describe('MiCuentaUsuarios', () => {
  let component: MiCuentaUsuarios;
  let fixture: ComponentFixture<MiCuentaUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiCuentaUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiCuentaUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
