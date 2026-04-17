import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/services/auth.service';
import { HomeComponent } from './home';
import { TrainingService } from '@features/training/services/training.service';

describe('HomeComponent', () => {
  const authServiceMock = {
    logout: vi.fn(),
    currentUser: signal({ username: 'test', nombre_completo: 'Test User' }),
    isAuthenticated: signal(true),
  };

  const trainingServiceMock = {
    getInProgressTrainings: vi.fn(),
  };

  beforeEach(async () => {
    authServiceMock.logout.mockReset();
    trainingServiceMock.getInProgressTrainings.mockReset();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: TrainingService, useValue: trainingServiceMock },
      ],
    }).compileComponents();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);

    return { fixture, component, router };
  }

  it('should create', () => {
    trainingServiceMock.getInProgressTrainings.mockReturnValue(of({ data: [] }));
    const { component } = createComponent();

    expect(component).toBeDefined();
  });

  it('should fetch and expose progress items', async () => {
    const mockData = [
      {
        id_intento: 1,
        fecha_creacion: '2026-04-12T22:44:10.401998-05:00',
        total_preguntas: 10,
        indice_pregunta_actual: 5,
      },
    ];
    trainingServiceMock.getInProgressTrainings.mockReturnValue(of({ data: mockData }));

    const { component, fixture } = createComponent();
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.progressItems().length).toBe(1);
    expect(component.progressItems()[0]?.title).toBe('TRAINING EN PROGRESO');
    expect(component.progressItems()[0]?.percentage).toBe(50);
  });

  it('should navigate to training', () => {
    trainingServiceMock.getInProgressTrainings.mockReturnValue(of({ data: [] }));
    const { component, router } = createComponent();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.goToTraining();

    expect(navigateSpy).toHaveBeenCalledWith(['/training']);
  });

  it('should navigate to session when resuming', () => {
    trainingServiceMock.getInProgressTrainings.mockReturnValue(of({ data: [] }));
    const { component, router } = createComponent();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.resumeTraining(123);

    expect(navigateSpy).toHaveBeenCalledWith(['/training/session', 123]);
  });
});
