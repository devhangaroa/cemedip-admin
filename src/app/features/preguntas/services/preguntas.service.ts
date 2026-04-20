import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import {
  PreguntaDetalle,
  PreguntaInput,
  PreguntaListadoItem,
  PreguntasFiltros,
} from '@core/models/preguntas.model';
import { Especialidad, TemaEspecialidad, TipoEspecialidad } from '@core/models/training.model';

@Injectable({
  providedIn: 'root',
})
export class PreguntasService {
  private readonly http = inject(HttpClient);

  getPreguntas(filtros: PreguntasFiltros): Observable<ApiSuccessResponse<PreguntaListadoItem[]>> {
    let params = new HttpParams();

    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    if (filtros.enunciado?.trim()) params = params.set('enunciado', filtros.enunciado.trim());
    if (filtros.alternativa?.trim()) params = params.set('alternativa', filtros.alternativa.trim());
    if (filtros.respuesta?.trim()) params = params.set('respuesta', filtros.respuesta.trim());
    filtros.especialidad?.forEach((e) => (params = params.append('especialidad', e)));
    filtros.tipo?.forEach((t) => (params = params.append('tipo', t)));
    filtros.tema?.forEach((t) => (params = params.append('tema', t)));
    if (filtros.feedback?.trim()) params = params.set('feedback', filtros.feedback.trim());

    return this.http.get<ApiSuccessResponse<PreguntaListadoItem[]>>(
      `${API_BASE_URL}/admin/preguntas/`,
      { params },
    );
  }

  getPregunta(id: number): Observable<ApiSuccessResponse<PreguntaDetalle>> {
    return this.http.get<ApiSuccessResponse<PreguntaDetalle>>(
      `${API_BASE_URL}/admin/preguntas/${id}/`,
    );
  }

  crearPregunta(data: PreguntaInput): Observable<ApiSuccessResponse<PreguntaDetalle>> {
    return this.http.post<ApiSuccessResponse<PreguntaDetalle>>(
      `${API_BASE_URL}/admin/preguntas/crear/`,
      data,
    );
  }

  actualizarPregunta(id: number, data: PreguntaInput): Observable<ApiSuccessResponse<PreguntaDetalle>> {
    return this.http.put<ApiSuccessResponse<PreguntaDetalle>>(
      `${API_BASE_URL}/admin/preguntas/${id}/`,
      data,
    );
  }

  getEspecialidades(): Observable<ApiSuccessResponse<Especialidad[]>> {
    return this.http.get<ApiSuccessResponse<Especialidad[]>>(
      `${API_BASE_URL}/cliente/preguntas/especialidades/`,
    );
  }

  getTipos(especialidadIds: number[]): Observable<ApiSuccessResponse<TipoEspecialidad[]>> {
    let params = new HttpParams();
    especialidadIds.forEach((id) => (params = params.append('especialidades', id)));

    return this.http.get<ApiSuccessResponse<TipoEspecialidad[]>>(
      `${API_BASE_URL}/cliente/preguntas/tipos/`,
      { params },
    );
  }

  getTemas(
    especialidadIds: number[],
    tipoIds: number[],
  ): Observable<ApiSuccessResponse<TemaEspecialidad[]>> {
    let params = new HttpParams();
    especialidadIds.forEach((id) => (params = params.append('especialidades', id)));
    tipoIds.forEach((id) => (params = params.append('tipos', id)));

    return this.http.get<ApiSuccessResponse<TemaEspecialidad[]>>(
      `${API_BASE_URL}/cliente/preguntas/temas/`,
      { params },
    );
  }

  eliminarPregunta(id: number): Observable<ApiSuccessResponse<null>> {
    return this.http.delete<ApiSuccessResponse<null>>(
      `${API_BASE_URL}/admin/preguntas/${id}/`,
    );
  }

  cargaMasivaPreguntas(archivo: File): Observable<ApiSuccessResponse<{ creados: number; errores: string[] }>> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<ApiSuccessResponse<{ creados: number; errores: string[] }>>(
      `${API_BASE_URL}/admin/preguntas/carga-masiva-excel/`,
      formData,
    );
  }

  crearEspecialidad(nombre: string): Observable<ApiSuccessResponse<{ id_especialidad: number; nombre: string }>> {
    return this.http.post<ApiSuccessResponse<{ id_especialidad: number; nombre: string }>>(
      `${API_BASE_URL}/admin/preguntas/especialidades/`,
      { nombre },
    );
  }

  crearTipo(nombre: string): Observable<ApiSuccessResponse<{ id_tipo: number; nombre: string }>> {
    return this.http.post<ApiSuccessResponse<{ id_tipo: number; nombre: string }>>(
      `${API_BASE_URL}/admin/preguntas/tipos/`,
      { nombre },
    );
  }

  crearTema(nombre: string): Observable<ApiSuccessResponse<{ id_tema: number; nombre: string }>> {
    return this.http.post<ApiSuccessResponse<{ id_tema: number; nombre: string }>>(
      `${API_BASE_URL}/admin/preguntas/temas/`,
      { nombre },
    );
  }
}
