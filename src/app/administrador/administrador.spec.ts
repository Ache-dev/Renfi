import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Administrador } from './administrador';

describe('Administrador', () => {
  let component: Administrador;
  let fixture: ComponentFixture<Administrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Administrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Administrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
