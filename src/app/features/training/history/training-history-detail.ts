import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';
import { QuestionComponent } from '@shared/components/question/question';
import { TrainingService } from '../services/training.service';
import { HistoryQuestion, TrainingHistoryDetail } from '@core/models/training.model';
import { Question } from '@shared/components/question/question.model';

@Component({
  selector: 'app-training-history-detail',
  imports: [RouterLink, ButtonModule, TopBarComponent, QuestionComponent, DatePipe],
  template: `
    <div class="bg-surface-50 flex min-h-screen flex-col font-sans">
      <app-top-bar />

      <main class="grow px-4 py-8 md:px-8 md:py-12">
        <section class="mx-auto flex max-w-4xl flex-col gap-10">
          <header class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div class="space-y-3">
              <p class="text-primary-300 text-sm font-semibold tracking-[0.18em] uppercase">
                Historial
              </p>
              <h1 class="text-primary-900 text-4xl font-bold tracking-tight uppercase md:text-5xl">
                RESULTADOS
              </h1>
            </div>

            <p-button
              label="VOLVER"
              variant="outlined"
              severity="secondary"
              routerLink="/training/history"
              [pt]="headerActionPt"
            />
          </header>

          @if (detailResource.isLoading()) {
            <div class="flex justify-center py-12">
              <i class="pi pi-spin pi-spinner text-primary text-4xl"></i>
            </div>
          } @else if (detail(); as data) {
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div class="bg-surface-0 border-surface-200 rounded-3xl border p-6 shadow-sm">
                <p class="text-surface-500 text-xs font-bold tracking-widest uppercase">Puntaje</p>
                <p class="text-primary-900 mt-2 text-3xl font-black">
                  {{ data.intento.puntaje_obtenido }}%
                </p>
              </div>

              <div class="bg-surface-0 border-surface-200 rounded-3xl border p-6 shadow-sm">
                <p class="text-surface-500 text-xs font-bold tracking-widest uppercase">
                  Correctas
                </p>
                <p class="text-primary-900 mt-2 text-3xl font-black">
                  {{ data.intento.correctas }} / {{ data.intento.total_preguntas }}
                </p>
              </div>

              <div class="bg-surface-0 border-surface-200 rounded-3xl border p-6 shadow-sm">
                <p class="text-surface-500 text-xs font-bold tracking-widest uppercase">Duración</p>
                <p class="text-primary-900 mt-2 text-3xl font-black">
                  {{ formatDuration(data.intento.duracion_real) }}
                </p>
              </div>

              <div class="bg-surface-0 border-surface-200 rounded-3xl border p-6 shadow-sm">
                <p class="text-surface-500 text-xs font-bold tracking-widest uppercase">Fecha</p>
                <p class="text-primary-900 mt-2 text-2xl font-black">
                  {{ data.intento.fecha_finalizacion | date: 'dd/MM/yyyy' }}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-12">
              @for (hq of data.preguntas; track hq.id_intento_pregunta) {
                <div class="bg-surface-0 border-surface-200 rounded-3xl border p-8 shadow-sm">
                  <app-question
                    [number]="hq.orden"
                    [question]="mapToQuestion(hq)"
                    [isAnswered]="true"
                    [selectedOptionId]="getSelectedOptionId(hq)"
                  />
                </div>
              }
            </div>
          }
        </section>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingHistoryDetailComponent {
  private readonly trainingService = inject(TrainingService);

  readonly idIntento = input.required<number, string | number>({
    transform: (v) => Number(v),
  });

  readonly detailResource = rxResource<TrainingHistoryDetail, { idIntento: number }>({
    params: () => ({ idIntento: this.idIntento() }),
    stream: ({ params: { idIntento } }) =>
      this.trainingService.getHistoryDetail(idIntento).pipe(map((r) => r.data)),
  });

  readonly detail = computed(() => this.detailResource.value());

  readonly headerActionPt = {
    root: { class: 'h-11 px-6 text-sm font-semibold tracking-[0.08em] uppercase shadow-none' },
    label: { class: 'px-0' },
  };

  formatDuration(duration: string): string {
    const parts = duration.split(':');
    if (parts.length < 3) return duration;

    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const s = Math.floor(parseFloat(parts[2]));

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  mapToQuestion(hq: HistoryQuestion): Question {
    return {
      id: hq.id_pregunta,
      text: hq.enunciado,
      options: hq.alternativas.map((alt) => ({
        id: alt.id_alternativa_intento,
        label: alt.contenido,
        isCorrect: alt.es_correcta,
        isSelected: alt.es_elegida,
      })),
      feedback: hq.feedback
        ? {
            text: hq.feedback.justificacion,
            source: hq.feedback.fuente,
          }
        : undefined,
    };
  }

  getSelectedOptionId(hq: HistoryQuestion): number | null {
    const selected = hq.alternativas.find((alt) => alt.es_elegida);
    return selected ? selected.id_alternativa_intento : null;
  }
}
