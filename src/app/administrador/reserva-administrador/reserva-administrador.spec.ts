import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ReservaAdministrador } from './reserva-administrador';

describe('ReservaAdministrador', () => {
  let component: ReservaAdministrador;
  let fixture: ComponentFixture<ReservaAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ReservaAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservaAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
