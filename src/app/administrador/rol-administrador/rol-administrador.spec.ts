import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { RolAdministrador } from './rol-administrador';

describe('RolAdministrador', () => {
  let component: RolAdministrador;
  let fixture: ComponentFixture<RolAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
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
