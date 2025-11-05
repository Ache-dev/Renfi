import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoAdministrador } from './pago-administrador';

describe('PagoAdministrador', () => {
  let component: PagoAdministrador;
  let fixture: ComponentFixture<PagoAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
