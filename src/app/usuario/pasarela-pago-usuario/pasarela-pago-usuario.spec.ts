import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasarelaPagoUsuario } from './pasarela-pago-usuario';

describe('PasarelaPagoUsuario', () => {
  let component: PasarelaPagoUsuario;
  let fixture: ComponentFixture<PasarelaPagoUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PasarelaPagoUsuario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasarelaPagoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
