import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import {
  Curso,
  CursoDeEstudiante,
  CursoDetalle,
  CursoEstudianteInscrito,
  CursosFiltros,
  CursoUpsertInput,
  EstudiantesInscritosFiltros,
} from '@core/models/cursos.model';

@Injectable({ providedIn: 'root' })
export class CursosService {
  private http = inject(HttpClient);

  getCursos(filtros: CursosFiltros): Observable<ApiSuccessResponse<Curso[]>> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    if (filtros.nombre) params = params.set('nombre', filtros.nombre);
    if (filtros.codigo) params = params.set('codigo', filtros.codigo);
    if (filtros.fecha_inicio_desde) params = params.set('fecha_inicio_desde', filtros.fecha_inicio_desde);
    if (filtros.fecha_fin_hasta) params = params.set('fecha_fin_hasta', filtros.fecha_fin_hasta);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.es_activo !== undefined) params = params.set('es_activo', filtros.es_activo);
    return this.http.get<ApiSuccessResponse<Curso[]>>(`${API_BASE_URL}/admin/cursos/`, { params });
  }

  getCurso(id: number): Observable<ApiSuccessResponse<CursoDetalle>> {
    return this.http.get<ApiSuccessResponse<CursoDetalle>>(`${API_BASE_URL}/admin/cursos/${id}/`);
  }

  crearCurso(data: CursoUpsertInput): Observable<ApiSuccessResponse<CursoDetalle>> {
    return this.http.post<ApiSuccessResponse<CursoDetalle>>(`${API_BASE_URL}/admin/cursos/`, data);
  }

  editarCurso(id: number, data: Partial<CursoUpsertInput>): Observable<ApiSuccessResponse<CursoDetalle>> {
    return this.http.patch<ApiSuccessResponse<CursoDetalle>>(`${API_BASE_URL}/admin/cursos/${id}/`, data);
  }

  eliminarCurso(id: number): Observable<ApiSuccessResponse<void>> {
    return this.http.delete<ApiSuccessResponse<void>>(`${API_BASE_URL}/admin/cursos/${id}/`);
  }

  getEstudiantesInscritos(
    id_curso: number,
    filtros: EstudiantesInscritosFiltros,
  ): Observable<ApiSuccessResponse<CursoEstudianteInscrito[]>> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    if (filtros.nombres) params = params.set('nombres', filtros.nombres);
    if (filtros.apellidos) params = params.set('apellidos', filtros.apellidos);
    if (filtros.identificacion) params = params.set('identificacion', filtros.identificacion);
    return this.http.get<ApiSuccessResponse<CursoEstudianteInscrito[]>>(
      `${API_BASE_URL}/admin/cursos/${id_curso}/estudiantes/`,
      { params },
    );
  }

  inscribirEstudiante(
    id_curso: number,
    id_estudiante: number,
  ): Observable<ApiSuccessResponse<CursoEstudianteInscrito>> {
    return this.http.post<ApiSuccessResponse<CursoEstudianteInscrito>>(
      `${API_BASE_URL}/admin/cursos/${id_curso}/estudiantes/`,
      { id_estudiante },
    );
  }

  desinscribirEstudiante(id_curso: number, id_inscripcion: number): Observable<ApiSuccessResponse<void>> {
    return this.http.delete<ApiSuccessResponse<void>>(
      `${API_BASE_URL}/admin/cursos/${id_curso}/estudiantes/${id_inscripcion}/`,
    );
  }

  getCursosDeEstudiante(
    id_estudiante: number,
    filtros: { page?: number; page_size?: number },
  ): Observable<ApiSuccessResponse<CursoDeEstudiante[]>> {
    let params = new HttpParams();
    if (filtros.page) params = params.set('page', filtros.page);
    if (filtros.page_size) params = params.set('page_size', filtros.page_size);
    return this.http.get<ApiSuccessResponse<CursoDeEstudiante[]>>(
      `${API_BASE_URL}/admin/seguridad/estudiantes/${id_estudiante}/cursos/`,
      { params },
    );
  }
}
