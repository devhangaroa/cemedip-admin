import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrainingHistoryComponent } from './training-history';
import { TrainingService } from '../services/training.service';

describe('TrainingHistoryComponent', () => {
  const trainingServiceMock = {
    getHistory: vi.fn(),
  };

  beforeEach(async () => {
    trainingServiceMock.getHistory.mockReset();

    await TestBed.configureTestingModule({
      imports: [TrainingHistoryComponent],
      providers: [provideRouter([]), { provide: TrainingService, useValue: trainingServiceMock }],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(TrainingHistoryComponent);
    const component = fixture.componentInstance;

    return { fixture, component };
  }

  it('should create', () => {
    trainingServiceMock.getHistory.mockReturnValue(of({ data: [] }));
    const { component } = createComponent();

    expect(component).toBeDefined();
  });

  it('should render HISTORIAL title', () => {
    trainingServiceMock.getHistory.mockReturnValue(of({ data: [] }));
    const { fixture } = createComponent();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('HISTORIAL');
  });

  it('should render search input and filter button', () => {
    trainingServiceMock.getHistory.mockReturnValue(of({ data: [] }));
    const { fixture } = createComponent();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[placeholder="Buscar"]')).toBeTruthy();
    expect(compiled.querySelector('p-button[label="FILTRO"]')).toBeTruthy();
  });

  it('should render a list of progress cards when history is available', async () => {
    const mockData = [
      {
        id_intento: 71,
        fecha_creacion: '2026-04-13T09:31:21.632303-05:00',
        total_preguntas: 5,
        total_correctas: 1,
        porcentaje: '20.00',
      },
    ];
    trainingServiceMock.getHistory.mockReturnValue(of({ data: mockData }));

    const { fixture } = createComponent();
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const progressCards = compiled.querySelectorAll('app-progress-card');
    expect(progressCards.length).toBe(1);
    expect(compiled.textContent).toContain('EXAMEN DE PRÁCTICA');
    expect(compiled.textContent).toContain('VER MÁS');
  });

  it('should show loading spinner when loading', async () => {
    const historySubject = new Subject<{
      data: {
        id_intento: number;
        fecha_creacion: string;
        total_preguntas: number;
        total_correctas: number;
        porcentaje: string;
      }[];
    }>();
    trainingServiceMock.getHistory.mockReturnValue(historySubject.asObservable());

    const { fixture } = createComponent();
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pi-spinner')).toBeTruthy();

    historySubject.next({ data: [] });
    historySubject.complete();

    await fixture.whenStable();
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pi-spinner')).toBeFalsy();
  });

  it('should have a back button pointing to /training', () => {
    trainingServiceMock.getHistory.mockReturnValue(of({ data: [] }));

    const { fixture } = createComponent();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector('p-button[routerLink="/training"]');
    expect(backButton).toBeTruthy();
  });
});
