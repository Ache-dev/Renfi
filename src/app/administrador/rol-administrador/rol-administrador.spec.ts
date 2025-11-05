import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolAdministrador } from './rol-administrador';

describe('RolAdministrador', () => {
  let component: RolAdministrador;
  let fixture: ComponentFixture<RolAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RolAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
