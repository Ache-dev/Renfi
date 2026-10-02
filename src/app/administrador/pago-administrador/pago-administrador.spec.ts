import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PagoAdministrador } from './pago-administrador';

describe('PagoAdministrador', () => {
  let component: PagoAdministrador;
  let fixture: ComponentFixture<PagoAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [PagoAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
