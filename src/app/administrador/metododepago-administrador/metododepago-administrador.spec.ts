import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetododepagoAdministrador } from './metododepago-administrador';

describe('MetododepagoAdministrador', () => {
  let component: MetododepagoAdministrador;
  let fixture: ComponentFixture<MetododepagoAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MetododepagoAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetododepagoAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
