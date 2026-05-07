export type EstadoCurso = 'sin_iniciar' | 'en_curso' | 'finalizado';

export interface Curso {
  id_curso: number;
  codigo: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_del_curso: EstadoCurso;
  es_activo: boolean;
  total_estudiantes_inscritos: number;
}

export interface CursoDetalle {
  id_curso: number;
  codigo: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_del_curso: EstadoCurso;
  es_activo: boolean;
}

export interface CursoUpsertInput {
  codigo: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  es_activo: boolean;
}

export interface CursoEstudianteInscrito {
  id_estudiante: number;
  id_estudiante_curso: number;
  nombres: string | null;
  apellidos: string | null;
  identificacion: string | null;
  correo_institucional: string | null;
}

export interface CursosFiltros {
  page?: number;
  page_size?: number;
  nombre?: string;
  codigo?: string;
  fecha_inicio_desde?: string;
  fecha_fin_hasta?: string;
  estado?: EstadoCurso;
  es_activo?: boolean;
}

export interface CursoDeEstudiante {
  id_inscripcion: number;
  id_curso: number;
  codigo: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado_del_curso: EstadoCurso;
  es_activo_curso: boolean;
}

export interface EstudiantesInscritosFiltros {
  page?: number;
  page_size?: number;
  nombres?: string;
  apellidos?: string;
  identificacion?: string;
}
