import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { ImagenService } from './imagen.service';

describe('ImagenService', () => {
  let service: ImagenService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  const archivo = (tipo = 'image/png', bytes = 1024, nombre = 'foto.png') =>
    new File([new Uint8Array(bytes)], nombre, { type: tipo });

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ImagenService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('validarArchivo', () => {
    it('acepta JPG, PNG y WebP dentro del límite', () => {
      for (const tipo of ['image/jpeg', 'image/png', 'image/webp']) {
        expect(service.validarArchivo(archivo(tipo))).toBeNull();
      }
    });

    it('rechaza otros formatos, vacíos y más de 5 MB', () => {
      expect(service.validarArchivo(archivo('image/gif'))).toContain('Formato no permitido');
      expect(service.validarArchivo(archivo('application/pdf'))).toContain('Formato no permitido');
      expect(service.validarArchivo(archivo('image/png', 5 * 1024 * 1024 + 1))).toContain('5 MB');
      expect(service.validarArchivo(archivo('image/png', 0))).toContain('vacío');
    });
  });

  describe('subirImagen', () => {
    it('envía multipart (campo "imagen") a /finca/:id/imagenes con texto y portada', () => {
      let res: any;
      service.subirImagen(5, archivo(), { textoAlternativo: ' Piscina ', esPortada: true }).subscribe((r) => (res = r));

      const req = http.expectOne(`${api}/finca/5/imagenes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      const form = req.request.body as FormData;
      expect((form.get('imagen') as File).name).toBe('foto.png');
      expect(form.get('TextoAlternativo')).toBe('Piscina');
      expect(form.get('EsPortada')).toBe('true');
      req.flush({ imagen: { IdImagen: 9, IdFinca: 5, UrlImagen: 'https://cdn/x.webp', EsPortada: true } });
      expect(res.IdImagen).toBe(9);
    });

    it('sin opciones no envía campos de texto', () => {
      service.subirImagen(5, archivo()).subscribe();
      const req = http.expectOne(`${api}/finca/5/imagenes`);
      const form = req.request.body as FormData;
      expect(form.has('TextoAlternativo')).toBeFalse();
      expect(form.has('EsPortada')).toBeFalse();
      req.flush({ imagen: {} });
    });

    it('no llama a la API si el archivo no es válido', () => {
      let err: any;
      service.subirImagen(5, archivo('image/gif')).subscribe({ error: (e) => (err = e) });
      http.expectNone(`${api}/finca/5/imagenes`);
      expect(err.message).toContain('Formato no permitido');
    });

    it('propaga el mensaje de la API (límite, formato, tamaño)', () => {
      let err: any;
      service.subirImagen(5, archivo()).subscribe({ error: (e) => (err = e) });
      http.expectOne(`${api}/finca/5/imagenes`).flush({ message: 'Cada finca admite máximo 10 imágenes.' }, { status: 409, statusText: 'Conflict' });
      expect(err.message).toBe('Cada finca admite máximo 10 imágenes.');
    });
  });

  it('establecerPortada envía PUT con EsPortada', () => {
    let res: any;
    service.establecerPortada(3).subscribe((r) => (res = r));
    const req = http.expectOne(`${api}/imagen/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ EsPortada: true });
    req.flush({ imagen: { IdImagen: 3, EsPortada: true } });
    expect(res.EsPortada).toBeTrue();
  });

  it('eliminar usa DELETE y propaga el error', () => {
    let listo = false;
    service.eliminar(3).subscribe(() => (listo = true));
    const req = http.expectOne(`${api}/imagen/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    expect(listo).toBeTrue();

    let err: any;
    service.eliminar(4).subscribe({ error: (e) => (err = e) });
    http.expectOne(`${api}/imagen/4`).flush({ message: 'Sin permisos' }, { status: 403, statusText: 'Forbidden' });
    expect(err.message).toBe('Sin permisos');
  });

  it('getGaleria devuelve la galería completa de la finca', () => {
    let res: any[] = [];
    service.getGaleria(5).subscribe((r) => (res = r));
    http.expectOne(`${api}/imagen/finca/5`).flush([{ IdImagen: 1, EsPortada: true, UrlImagen: 'u' }]);
    expect(res.length).toBe(1);
  });

  it('getIndiceImagenes prefiere la portada de cada finca', () => {
    let mapa = new Map<string, string>();
    service.getIndiceImagenes().subscribe((m) => (mapa = m));
    http.expectOne(`${api}/imagen`).flush([
      { IdImagen: 1, IdFinca: 5, UrlImagen: 'https://cdn/a.webp', EsPortada: false },
      { IdImagen: 2, IdFinca: 5, UrlImagen: 'https://cdn/b.webp', EsPortada: true }
    ]);
    expect(mapa.get('5')).toBe('https://cdn/b.webp');
  });
});
