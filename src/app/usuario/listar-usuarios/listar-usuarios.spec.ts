import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarUsuarios } from './listar-usuarios';

describe('ListarUsuarios', () => {
  let component: ListarUsuarios;
  let fixture: ComponentFixture<ListarUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarUsuarios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarUsuarios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
