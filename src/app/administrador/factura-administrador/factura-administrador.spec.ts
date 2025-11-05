import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaAdministrador } from './factura-administrador';

describe('FacturaAdministrador', () => {
  let component: FacturaAdministrador;
  let fixture: ComponentFixture<FacturaAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FacturaAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturaAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
