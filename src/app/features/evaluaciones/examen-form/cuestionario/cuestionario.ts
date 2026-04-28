import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { EvaluacionesService } from '@core/services/evaluaciones.service';
import { ToastService } from '@core/services/toast.service';
import { CuestionarioPregunta, CuestionarioRespuesta } from '@core/models/evaluaciones.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-examen-cuestionario',
  imports: [ButtonModule],
  templateUrl: './cuestionario.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenCuestionarioComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly evaluacionesService = inject(EvaluacionesService);
  private readonly toast = inject(ToastService);

  private get idExamen(): number | null {
    const idStr = this.route.parent?.snapshot.paramMap.get('id');
    return idStr ? Number(idStr) : null;
  }

  protected readonly cuestionarioResource = rxResource({
    stream: () => {
      const id = this.idExamen;
      if (!id) return of([] as CuestionarioPregunta[]);
      return this.evaluacionesService.getCuestionarioExamen(id).pipe(
        map((r) => r.data),
        catchError(() => of([] as CuestionarioPregunta[])),
      );
    },
  });

  protected readonly preguntas = computed((): CuestionarioPregunta[] => this.cuestionarioResource.value() ?? []);
  protected readonly isLoading = computed(() => this.cuestionarioResource.isLoading());

  protected readonly expandedPreguntaId = signal<number | null>(null);
  protected readonly confirmandoId = signal<number | null>(null);
  protected readonly recalTodosId = signal<number | null>(null);
  protected readonly recalIndividualKey = signal<string | null>(null);

  private readonly respuestasParams = signal<{ idExamen: number; idPregunta: number } | null>(null);

  protected readonly respuestasResource = rxResource({
    params: () => this.respuestasParams(),
    stream: ({ params }) => {
      if (!params) return of([] as CuestionarioRespuesta[]);
      return this.evaluacionesService.getRespuestasPregunta(params.idExamen, params.idPregunta).pipe(
        map((r) => r.data),
        catchError(() => of([] as CuestionarioRespuesta[])),
      );
    },
  });

  protected readonly respuestas = computed((): CuestionarioRespuesta[] => this.respuestasResource.value() ?? []);

  toggleExpandir(idPregunta: number): void {
    if (this.expandedPreguntaId() === idPregunta) {
      this.expandedPreguntaId.set(null);
      this.respuestasParams.set(null);
    } else {
      this.expandedPreguntaId.set(idPregunta);
      const id = this.idExamen;
      if (id) this.respuestasParams.set({ idExamen: id, idPregunta });
    }
    this.confirmandoId.set(null);
  }

  iniciarRecalTodos(idPregunta: number): void {
    this.confirmandoId.set(idPregunta);
  }

  cancelarRecalTodos(): void {
    this.confirmandoId.set(null);
  }

  confirmarRecalTodos(idPregunta: number): void {
    const id = this.idExamen;
    if (!id || this.recalTodosId() !== null) return;
    this.recalTodosId.set(idPregunta);
    this.confirmandoId.set(null);
    this.evaluacionesService.recalificarPregunta(id, idPregunta).subscribe({
      next: (res) => {
        this.recalTodosId.set(null);
        this.toast.success(`${res.data.intentos_afectados} intento(s) recalificado(s).`);
        this.cuestionarioResource.reload();
        if (this.expandedPreguntaId() === idPregunta) {
          this.respuestasResource.reload();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.recalTodosId.set(null);
      },
    });
  }

  darPuntoIndividual(idPregunta: number, intentoId: number): void {
    const id = this.idExamen;
    const key = `${idPregunta}-${intentoId}`;
    if (!id || this.recalIndividualKey() !== null) return;
    this.recalIndividualKey.set(key);
    this.evaluacionesService.recalificarPreguntaIndividual(id, idPregunta, intentoId).subscribe({
      next: () => {
        this.recalIndividualKey.set(null);
        this.toast.success('Punto otorgado correctamente.');
        this.cuestionarioResource.reload();
        this.respuestasResource.reload();
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.recalIndividualKey.set(null);
      },
    });
  }

  porcentajeAcierto(p: CuestionarioPregunta): number {
    if (!p.total_respuestas) return 0;
    return Math.round((p.correctas / p.total_respuestas) * 100);
  }
}
