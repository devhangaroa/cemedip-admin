import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TopBarComponent } from '@shared/components/top-bar/top-bar';
import { ProgressCardComponent } from '@shared/components/progress-card/progress-card';
import { TrainingService } from '../services/training.service';

@Component({
  selector: 'app-training-history',
  imports: [
    RouterLink,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TopBarComponent,
    ProgressCardComponent,
    DatePipe,
  ],
  template: `
    <div class="bg-surface-50 flex min-h-screen flex-col">
      <app-top-bar />

      <main class="grow px-4 py-8 md:px-8 md:py-12">
        <section class="mx-auto flex max-w-6xl flex-col gap-10">
          <header class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div class="space-y-3">
              <p class="text-primary-300 text-sm font-semibold tracking-[0.18em] uppercase">
                Training
              </p>
              <h1 class="text-primary-900 text-4xl font-bold tracking-tight uppercase md:text-5xl">
                HISTORIAL
              </h1>
            </div>

            <p-button
              label="VOLVER"
              variant="outlined"
              severity="secondary"
              routerLink="/training"
              [pt]="headerActionPt"
            />
          </header>

          <div class="flex flex-wrap items-center gap-4">
            <p-iconfield class="grow md:max-w-md">
              <input
                type="text"
                id="training-history-search"
                name="training-history-search"
                autocomplete="off"
                pInputText
                placeholder="Buscar"
                class="w-full font-medium"
                variant="filled"
              />
              <p-inputicon class="pi pi-search" />
            </p-iconfield>

            <p-button label="FILTRO" icon="pi pi-filter" severity="primary" [pt]="filterActionPt" />
          </div>

          @if (historyResource.isLoading()) {
            <div class="flex justify-center py-12">
              <i class="pi pi-spin pi-spinner text-primary text-4xl"></i>
            </div>
          } @else {
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              @for (item of historyItems(); track item.id_intento) {
                <app-progress-card
                  title="EXAMEN DE PRÁCTICA"
                  [date]="(item.fecha_creacion | date: 'dd/MM/yyyy') ?? ''"
                  [dateLabel]="null"
                  actionLabel="VER MÁS"
                  (actionClick)="onViewDetail(item.id_intento)"
                />
              } @empty {
                @if (!historyResource.isLoading()) {
                  <div class="bg-surface-0 col-span-full rounded-3xl p-12 text-center shadow-sm">
                    <i class="pi pi-history text-surface-300 mb-4 text-6xl"></i>
                    <p class="text-surface-500 text-xl font-medium">
                      Aún no tienes historial de training.
                    </p>
                  </div>
                }
              }
            </div>
          }
        </section>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingHistoryComponent {
  private readonly trainingService = inject(TrainingService);
  private readonly router = inject(Router);

  readonly historyResource = rxResource({
    stream: () => this.trainingService.getHistory().pipe(map((r) => r.data)),
  });

  readonly historyItems = computed(() => this.historyResource.value() ?? []);

  readonly headerActionPt = {
    root: { class: 'h-11 px-6 text-sm font-semibold tracking-[0.08em] uppercase shadow-none' },
    label: { class: 'px-0' },
  };

  readonly filterActionPt = {
    root: { class: 'h-11 px-6 text-sm font-semibold tracking-[0.08em] uppercase' },
    label: { class: 'px-0' },
  };

  onViewDetail(id: number): void {
    this.router.navigate(['/training/history', id]);
  }
}
