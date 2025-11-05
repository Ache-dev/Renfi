import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAdministrador } from './header-administrador';

describe('HeaderAdministrador', () => {
  let component: HeaderAdministrador;
  let fixture: ComponentFixture<HeaderAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeaderAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
