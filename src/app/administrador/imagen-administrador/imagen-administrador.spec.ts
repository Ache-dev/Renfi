import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';

import { ImagenAdministrador } from './imagen-administrador';

describe('ImagenAdministrador', () => {
  let component: ImagenAdministrador;
  let fixture: ComponentFixture<ImagenAdministrador>;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const galeria = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ IdImagen: i + 1, IdFinca: 5, UrlImagen: `https://cdn/${i + 1}.webp`, Orden: i + 1, EsPortada: i === 0 }));

  const cargarFinca = (imagenes = galeria(2)) => {
    component.seleccionarFinca('5');
    http.expectOne(`${api}/imagen/finca/5`).flush(imagenes);
    fixture.detectChanges();
  };

  const elegirArchivo = (archivo: File) => {
    const input = document.createElement('input');
    input.type = 'file'; // solo los input file tienen .files
    const datos = new DataTransfer();
    datos.items.add(archivo);
    input.files = datos.files;
    component.onArchivoElegido({ target: input } as unknown as Event);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      declarations: [ImagenAdministrador]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ImagenAdministrador);
    component = fixture.componentInstance;
    fixture.detectChanges();
    http.expectOne(`${api}/finca`).flush([
      { IdFinca: 6, NombreFinca: 'Villa Los Samanes' },
      { IdFinca: 5, NombreFinca: 'Finca El Paraíso' }
    ]);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('lista las fincas ordenadas por nombre', () => {
    expect(component.fincas.map((f) => f.nombre)).toEqual(['Finca El Paraíso', 'Villa Los Samanes']);
  });

  it('al elegir una finca carga su galería', () => {
    cargarFinca();
    expect(component.fincaId).toBe(5);
    expect(component.galeria.length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.galeria__item').length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Portada');
  });

  it('no sube archivos inválidos: muestra el error sin llamar a la API', () => {
    cargarFinca();
    elegirArchivo(new File([new Uint8Array(10)], 'a.gif', { type: 'image/gif' }));
    http.expectNone(`${api}/finca/5/imagenes`);
    expect(component.error).toContain('Formato no permitido');
  });

  it('sube una imagen válida y recarga la galería', () => {
    cargarFinca();
    elegirArchivo(new File([new Uint8Array(100)], 'foto.png', { type: 'image/png' }));
    const subida = http.expectOne(`${api}/finca/5/imagenes`);
    expect(subida.request.method).toBe('POST');
    subida.flush({ imagen: { IdImagen: 3, IdFinca: 5 } });
    http.expectOne(`${api}/imagen/finca/5`).flush(galeria(3));
    expect(component.aviso).toBe('Imagen subida correctamente.');
    expect(component.galeria.length).toBe(3);
    expect(component.subiendo).toBeFalse();
  });

  it('con el máximo de imágenes no deja subir otra', () => {
    cargarFinca(galeria(10));
    expect(component.lleno).toBeTrue();
    elegirArchivo(new File([new Uint8Array(100)], 'foto.png', { type: 'image/png' }));
    http.expectNone(`${api}/finca/5/imagenes`);
    expect(component.error).toContain('máximo de 10');
  });

  it('muestra el error de la API al subir', () => {
    cargarFinca();
    elegirArchivo(new File([new Uint8Array(100)], 'foto.png', { type: 'image/png' }));
    http.expectOne(`${api}/finca/5/imagenes`).flush({ message: 'La imagen supera el tamaño máximo de 5 MB.' }, { status: 413, statusText: 'Payload Too Large' });
    expect(component.error).toBe('La imagen supera el tamaño máximo de 5 MB.');
  });

  it('hacer portada llama a la API y recarga', () => {
    cargarFinca();
    component.hacerPortada(component.galeria[1]);
    const req = http.expectOne(`${api}/imagen/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ EsPortada: true });
    req.flush({ imagen: { IdImagen: 2, EsPortada: true } });
    http.expectOne(`${api}/imagen/finca/5`).flush(galeria(2));
    expect(component.aviso).toBe('Portada actualizada.');
    expect(component.ocupada).toBeNull();
  });

  it('eliminar pide confirmación antes de borrar', () => {
    cargarFinca();
    component.pedirEliminar(component.galeria[1]);
    http.expectNone(`${api}/imagen/2`);
    expect(component.porEliminar).not.toBeNull();

    component.confirmarEliminar();
    const req = http.expectOne(`${api}/imagen/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    http.expectOne(`${api}/imagen/finca/5`).flush(galeria(1));
    expect(component.porEliminar).toBeNull();
    expect(component.aviso).toBe('Imagen eliminada.');
  });

  it('cancelar la confirmación no borra nada', () => {
    cargarFinca();
    component.pedirEliminar(component.galeria[0]);
    component.cancelarEliminar();
    expect(component.porEliminar).toBeNull();
  });
});
