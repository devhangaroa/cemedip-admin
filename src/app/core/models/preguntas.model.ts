export interface PreguntaListadoItem {
  id_pregunta: number;
  enunciado: string;
  especialidad: string | null;
  tema: string | null;
  tipo: string | null;
  alternativas: string | null;
  respuesta: string | null;
  feedback: string | null;
  estado: boolean;
}

export interface PreguntasFiltros {
  page?: number;
  page_size?: number;
  enunciado?: string;
  alternativa?: string;
  respuesta?: string;
  tema?: number[] | null;
  especialidad?: number[] | null;
  tipo?: number[] | null;
  feedback?: string;
}

export interface AlternativaDetalle {
  id_alternativa: number;
  identificador_letra: string;
  contenido: string;
  es_correcta: boolean;
}

export interface PreguntaDetalle {
  id_pregunta: number;
  enunciado: string;
  anho: string | null;
  especialidad_id: number | null;
  especialidad_nombre: string | null;
  tipo_id: number | null;
  tipo_nombre: string | null;
  tema_id: number | null;
  tema_nombre: string | null;
  alternativas: AlternativaDetalle[];
  feedback: string | null;
  fuente: string | null;
  estado: boolean;
}

export interface AlternativaInput {
  identificador_letra: string;
  contenido: string;
  es_correcta: boolean;
}

export interface PreguntaInput {
  enunciado: string;
  anho?: string | null;
  especialidad_id?: number | null;
  tipo_id?: number | null;
  tema_id?: number | null;
  justificacion?: string | null;
  fuente?: string | null;
  es_activo?: boolean;
  alternativas: AlternativaInput[];
}
