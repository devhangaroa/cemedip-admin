import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@core/constants/api';
import { ApiSuccessResponse } from '@core/models/api.model';
import {
  AnswerResponseData,
  CreateTrainingRequest,
  Especialidad,
  TemaEspecialidad,
  TipoEspecialidad,
  TrainingAttempt,
  TrainingAttemptResult,
  TrainingHistoryDetail,
  TrainingHistoryItem,
  TrainingInProgress,
  TrainingQuestion,
  TrainingQuestionDetail,
} from '@core/models/training.model';
import { TrainingService } from './training.service';

describe('TrainingService', () => {
  let service: TrainingService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TrainingService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should request training history detail', () => {
    const attemptId = 71;
    const response: ApiSuccessResponse<TrainingHistoryDetail> = {
      status: 'success',
      statusCode: 200,
      data: {
        intento: {
          id_intento: attemptId,
          estado: 'finalizado',
          correctas: 1,
          total_preguntas: 5,
          porcentaje: '20.00',
          puntaje_obtenido: '20.00',
          duracion_real: '00:00:26.423140',
          fecha_finalizacion: '2026-04-13T09:31:48.055443-05:00',
        },
        preguntas: [],
      },
    };

    service.getHistoryDetail(attemptId).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(
      `${API_BASE_URL}/cliente/evaluaciones/training/historial/${attemptId}/`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should request especialidades', () => {
    const response: ApiSuccessResponse<Especialidad[]> = {
      status: 'success',
      statusCode: 200,
      data: [{ id_especialidad: 1, nombre: 'Cardiologia' }],
    };

    service.getEspecialidades().subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(
      `${API_BASE_URL}/cliente/preguntas/especialidades/`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should serialize repeated especialidad params when requesting tipos', () => {
    const especialidadIds = ['1', '2'];
    const response: ApiSuccessResponse<TipoEspecialidad[]> = {
      status: 'success',
      statusCode: 200,
      data: [{ id_tipo: 10, nombre: 'Clinico' }],
    };

    service.getTipos(especialidadIds).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne((request) => {
      return request.method === 'GET' && request.url === `${API_BASE_URL}/cliente/preguntas/tipos/`;
    });
    expect(req.request.method).toBe('GET');
    expect(req.request.params.getAll('especialidades')).toEqual(especialidadIds);
    req.flush(response);
  });

  it('should serialize especialidad and tipo params when requesting temas', () => {
    const especialidadIds = ['1', '2'];
    const tipoIds = ['10', '11'];
    const response: ApiSuccessResponse<TemaEspecialidad[]> = {
      status: 'success',
      statusCode: 200,
      data: [{ id_tema: 100, nombre: 'Electrofisiologia' }],
    };

    service.getTemas(especialidadIds, tipoIds).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne((request) => {
      return request.method === 'GET' && request.url === `${API_BASE_URL}/cliente/preguntas/temas/`;
    });
    expect(req.request.method).toBe('GET');
    expect(req.request.params.getAll('especialidades')).toEqual(especialidadIds);
    expect(req.request.params.getAll('tipos')).toEqual(tipoIds);
    req.flush(response);
  });

  it('should post training creation payload', () => {
    const request: CreateTrainingRequest = {
      especialidades: [1],
      tipos: [10],
      temas: [100],
      numero_preguntas: 20,
    };
    const response: ApiSuccessResponse<TrainingAttempt> = {
      status: 'success',
      statusCode: 201,
      data: {
        id_intento: 68,
        tipo: 'training',
        estado: 'pendiente',
        fecha_creacion: '2026-04-13T09:08:38.279397-05:00',
        total_preguntas: 20,
        indice_pregunta_actual: 0,
      },
    };

    service.createTraining(request).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(`${API_BASE_URL}/cliente/evaluaciones/training/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(response);
  });

  it('should request a training attempt by id', () => {
    const attemptId = 68;
    const response: ApiSuccessResponse<TrainingAttempt> = {
      status: 'success',
      statusCode: 200,
      data: {
        id_intento: attemptId,
        tipo: 'training',
        estado: 'en_progreso',
        fecha_creacion: '2026-04-13T09:08:38.279397-05:00',
        total_preguntas: 20,
        indice_pregunta_actual: 4,
      },
    };

    service.getTrainingAttempt(attemptId).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(
      `${API_BASE_URL}/cliente/evaluaciones/training/${attemptId}/`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should map the nested question payload to a TrainingQuestionDetail', () => {
    const attemptId = 68;
    const questionIndex = 4;
    const question: TrainingQuestionDetail = {
      id_pregunta: 501,
      enunciado: 'Pregunta de prueba',
      enunciado_anho: 'Pregunta 2025',
      anho: '2025',
      especialidad: { id_especialidad: 1, nombre: 'Cardiologia' },
      tipo: { id_tipo: 10, nombre: 'Clinico' },
      tema: { id_tema: 100, nombre: 'Electrofisiologia' },
      alternativas: [
        {
          id_alternativa_intento: 900,
          identificador_numerico: 1,
          identificador_letra: 'A',
          contenido: 'Alternativa A',
        },
      ],
    };
    const response: ApiSuccessResponse<TrainingQuestion> = {
      status: 'success',
      statusCode: 200,
      data: {
        orden: questionIndex,
        id_intento_pregunta: 700,
        pregunta: question,
      },
    };

    service.getQuestion(attemptId, questionIndex).subscribe((result) => {
      expect(result).toEqual(question);
    });

    const req = httpTestingController.expectOne(
      `${API_BASE_URL}/cliente/evaluaciones/training/${attemptId}/pregunta/${questionIndex}/`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should post the selected answer for a question', () => {
    const attemptId = 68;
    const questionIndex = 4;
    const alternativeId = 900;
    const response: ApiSuccessResponse<AnswerResponseData> = {
      status: 'success',
      statusCode: 200,
      data: {
        orden: questionIndex,
        id_intento_pregunta: 700,
        es_correcta: true,
        es_sin_responder: false,
        feedback: {
          justificacion: 'Correcto',
          fuente: 'Guia',
          justificacion_fuente: 'Referencia oficial',
        },
        alternativas: [
          {
            id_alternativa_intento: alternativeId,
            identificador_numerico: 1,
            identificador_letra: 'A',
            contenido: 'Alternativa A',
            es_elegida: true,
            es_correcta: true,
          },
        ],
        indice_pregunta_actual: 5,
        total_preguntas: 20,
      },
    };

    service.answerQuestion(attemptId, questionIndex, alternativeId).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(
      `${API_BASE_URL}/cliente/evaluaciones/training/${attemptId}/pregunta/${questionIndex}/`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id_alternativa_intento: alternativeId });
    req.flush(response);
  });

  it('should post the training finish payload', () => {
    const attemptId = 68;
    const response: ApiSuccessResponse<TrainingAttemptResult> = {
      status: 'success',
      statusCode: 200,
      data: {
        id_intento: attemptId,
        estado: 'finalizado',
        correctas: 14,
        total_preguntas: 20,
        porcentaje: '70.00',
        puntaje_obtenido: '14.00',
        duracion_real: '00:12:45.000000',
        fecha_finalizacion: '2026-04-13T09:08:38.279397-05:00',
      },
    };

    service.finishTraining(attemptId).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(
      `${API_BASE_URL}/cliente/evaluaciones/training/terminar/`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ id_intento: attemptId });
    req.flush(response);
  });

  it('should request training history', () => {
    const response: ApiSuccessResponse<TrainingHistoryItem[]> = {
      status: 'success',
      statusCode: 200,
      data: [
        {
          id_intento: 71,
          fecha_creacion: '2026-04-13T09:31:21.632303-05:00',
          total_preguntas: 5,
          total_correctas: 1,
          porcentaje: '20.00',
        },
      ],
    };

    service.getHistory().subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(
      `${API_BASE_URL}/cliente/evaluaciones/training/historial/`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('should request in-progress trainings', () => {
    const response: ApiSuccessResponse<TrainingInProgress[]> = {
      status: 'success',
      statusCode: 200,
      data: [
        {
          id_intento: 69,
          fecha_creacion: '2026-04-12T22:44:10.401998-05:00',
          total_preguntas: 3,
          indice_pregunta_actual: 3,
        },
      ],
    };

    service.getInProgressTrainings().subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpTestingController.expectOne(`${API_BASE_URL}/cliente/evaluaciones/training/`);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });
});
