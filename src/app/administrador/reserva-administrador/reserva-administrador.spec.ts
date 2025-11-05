import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservaAdministrador } from './reserva-administrador';

describe('ReservaAdministrador', () => {
  let component: ReservaAdministrador;
  let fixture: ComponentFixture<ReservaAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
