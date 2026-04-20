export interface Intento {
  id_intento: number;
  nombres: string | null;
  apellidos: string | null;
  identificacion: string | null;
  correo: string | null;
  tipo_intento: 'training' | 'examen';
  nombre_intento: string | null;
  temas: string[];
  estado_intento: 'en_progreso' | 'finalizado' | 'vencido';
  puntaje: string | null;
  porcentaje: number | null;
  preguntas: number;
  fecha_creacion: string;
}

export interface IntentosFiltros {
  page?: number;
  page_size?: number;
  nombres?: string;
  apellidos?: string;
  identificacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}
