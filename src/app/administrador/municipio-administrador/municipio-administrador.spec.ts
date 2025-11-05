import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipioAdministrador } from './municipio-administrador';

describe('MunicipioAdministrador', () => {
  let component: MunicipioAdministrador;
  let fixture: ComponentFixture<MunicipioAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
