import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TrainingAttemptResult } from '@core/models/training.model';

@Component({
  selector: 'app-training-result-modal',
  imports: [ButtonModule, DialogModule],
  template: `
    <p-dialog
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [closable]="false"
      [resizable]="false"
      [draggable]="false"
      [pt]="dialogPt"
      [showHeader]="false"
    >
      <div class="flex flex-col items-center gap-6 text-center">
        <div
          class="bg-primary-50 text-primary-500 flex h-20 w-20 items-center justify-center rounded-full"
        >
          <i class="pi pi-check-circle text-5xl"></i>
        </div>

        <div>
          <h2
            class="text-primary-900 mb-2 text-2xl font-extrabold tracking-tight uppercase lg:text-3xl"
          >
            TRAINING FINALIZADO
          </h2>
          <p class="text-surface-600 text-base font-medium">
            Has completado todas las preguntas del entrenamiento.
          </p>
        </div>

        @if (result(); as res) {
          <div class="bg-surface-50 grid w-full grid-cols-2 gap-4 rounded-2xl p-6">
            <div class="flex flex-col items-center gap-1">
              <span class="text-surface-500 text-xs font-semibold tracking-wider uppercase">
                CORRECTAS
              </span>
              <span class="text-surface-900 text-2xl font-bold">
                {{ res.correctas }} / {{ res.total_preguntas }}
              </span>
            </div>
            <div class="flex flex-col items-center gap-1">
              <span class="text-surface-500 text-xs font-semibold tracking-wider uppercase">
                PUNTAJE
              </span>
              <span class="text-surface-900 text-2xl font-bold"> {{ res.porcentaje }}% </span>
            </div>
          </div>
        }

        <div class="flex w-full flex-col items-center pt-2">
          <p-button label="VOLVER AL INICIO" [pt]="buttonPt" (click)="home.emit()" />
        </div>
      </div>
    </p-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingResultModalComponent {
  readonly visible = input.required<boolean>();
  readonly result = input<TrainingAttemptResult | null>(null);

  readonly visibleChange = output<boolean>();
  readonly home = output<void>();

  readonly dialogPt = {
    mask: { class: 'app-dialog-mask' },
    root: { class: 'w-full max-w-xl border-none mx-4' },
    content: {
      class:
        'relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-surface-0 p-8 lg:p-12',
    },
  };

  readonly buttonPt = {
    root: {
      class:
        'h-14 w-64 rounded-xl text-base font-bold tracking-widest uppercase shadow-md shadow-primary-200',
    },
  };

  onVisibleChange(val: boolean) {
    this.visibleChange.emit(val);
  }
}
