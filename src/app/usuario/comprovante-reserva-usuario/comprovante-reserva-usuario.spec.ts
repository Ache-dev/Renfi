import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprovanteReservaUsuario } from './comprovante-reserva-usuario';

describe('ComprovanteReservaUsuario', () => {
  let component: ComprovanteReservaUsuario;
  let fixture: ComponentFixture<ComprovanteReservaUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComprovanteReservaUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprovanteReservaUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
