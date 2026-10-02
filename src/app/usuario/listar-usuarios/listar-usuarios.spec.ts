import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ListarUsuariosComponent } from './listar-usuarios';
import { UsuarioService } from '../../core/services/usuario.service';

describe('ListarUsuariosComponent', () => {
  let component: ListarUsuariosComponent;
  let fixture: ComponentFixture<ListarUsuariosComponent>;
  let mockUsuarioService: jasmine.SpyObj<UsuarioService>;

  beforeEach(async () => {
    mockUsuarioService = jasmine.createSpyObj('UsuarioService', ['getUsuarios']);
    mockUsuarioService.getUsuarios.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ListarUsuariosComponent],
      providers: [
        { provide: UsuarioService, useValue: mockUsuarioService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
