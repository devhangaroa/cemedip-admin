import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrainingHistoryDetailComponent } from './training-history-detail';
import { TrainingService } from '../services/training.service';

describe('TrainingHistoryDetailComponent', () => {
  const trainingServiceMock = {
    getHistoryDetail: vi.fn(),
  };

  const mockDetail = {
    intento: {
      id_intento: 71,
      estado: 'finalizado',
      correctas: 1,
      total_preguntas: 5,
      porcentaje: '20.00',
      puntaje_obtenido: '20.00',
      duracion_real: '00:00:26.423140',
      fecha_finalizacion: '2026-04-13T09:31:48.055443-05:00',
    },
    preguntas: [
      {
        orden: 1,
        id_intento_pregunta: 951,
        es_correcta: false,
        es_sin_responder: false,
        id_pregunta: 12176,
        enunciado: 'Test Question',
        enunciado_anho: '(2023) Test Question',
        anho: '2023',
        alternativas: [
          {
            id_alternativa_intento: 3701,
            identificador_numerico: 1,
            identificador_letra: 'a',
            contenido: 'Option A',
            es_elegida: true,
            es_correcta: false,
          },
        ],
        feedback: {
          justificacion: 'Justification',
          fuente: 'Source',
        },
      },
    ],
  };

  beforeEach(async () => {
    trainingServiceMock.getHistoryDetail.mockReset();

    await TestBed.configureTestingModule({
      imports: [TrainingHistoryDetailComponent],
      providers: [provideRouter([]), { provide: TrainingService, useValue: trainingServiceMock }],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(TrainingHistoryDetailComponent);
    fixture.componentRef.setInput('idIntento', 71);
    const component = fixture.componentInstance;

    return { fixture, component };
  }

  it('should create', () => {
    trainingServiceMock.getHistoryDetail.mockReturnValue(of({ data: mockDetail }));
    const { component } = createComponent();

    expect(component).toBeDefined();
  });

  it('should render results summary', async () => {
    trainingServiceMock.getHistoryDetail.mockReturnValue(of({ data: mockDetail }));
    const { fixture } = createComponent();
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('20.00%');
    expect(compiled.textContent).toContain('1 / 5');
    expect(compiled.textContent).toContain('26s');
    expect(compiled.textContent).toContain('13/04/2026');
  });

  it('should render questions', async () => {
    trainingServiceMock.getHistoryDetail.mockReturnValue(of({ data: mockDetail }));
    const { fixture } = createComponent();
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-question').length).toBe(1);
    expect(compiled.textContent).toContain('Test Question');
  });

  it('should format duration correctly', () => {
    trainingServiceMock.getHistoryDetail.mockReturnValue(of({ data: mockDetail }));
    const { component } = createComponent();

    expect(component.formatDuration('00:00:26.423140')).toBe('26s');
    expect(component.formatDuration('00:05:26.423140')).toBe('5m 26s');
    expect(component.formatDuration('01:05:26.423140')).toBe('1h 5m 26s');
  });
});
