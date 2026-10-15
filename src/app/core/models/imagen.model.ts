export interface ImagenFinca {
  IdImagen?: number | string;
  idImagen?: number | string;
  IdFinca?: number | string;
  idFinca?: number | string;
  /** URL pública lista para mostrar (la calcula la API desde la ruta en Supabase Storage). */
  UrlImagen?: string;
  urlImagen?: string;
  Orden?: number;
  EsPortada?: boolean;
  TextoAlternativo?: string | null;
  Ancho?: number | null;
  Alto?: number | null;
  Descripcion?: string;
  [key: string]: unknown;
}
