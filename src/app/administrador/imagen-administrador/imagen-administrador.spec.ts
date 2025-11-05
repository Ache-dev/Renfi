import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagenAdministrador } from './imagen-administrador';

describe('ImagenAdministrador', () => {
  let component: ImagenAdministrador;
  let fixture: ComponentFixture<ImagenAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagenAdministrador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagenAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
