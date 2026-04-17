import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-progress-card',
  imports: [ProgressBarModule, ButtonModule],
  template: `
    <div
      class="bg-surface-100 border-primary border-y-none border-r-none flex w-full flex-col justify-between gap-4 rounded-xl border-l-8 py-5 pr-5 pl-4 transition-all md:flex-row md:items-center"
    >
      <div class="flex min-w-0 items-center gap-5 md:gap-6">
        <div class="bg-surface-300 h-14 w-14 shrink-0 rounded-full md:h-16 md:w-16"></div>

        <div class="flex flex-col items-start gap-1">
          <h3 class="text-primary-800 text-base font-bold tracking-tight uppercase md:text-lg">
            {{ title() }}
          </h3>
          <p class="text-surface-500 text-[11px] font-semibold uppercase md:text-xs">
            {{ specialty() ?? 'ESPECIALIDAD' }}{{ topic() ? ', ' + topic() : '' }}
          </p>
          <span class="text-surface-600 mt-1 text-[11px] font-semibold uppercase md:text-xs">
            {{ dateLabel() ? dateLabel() + ': ' : '' }}{{ date() }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 flex-col items-end gap-3 md:items-center md:justify-end">
        @if (percentage() !== undefined && percentage() !== null) {
          <div class="flex w-full min-w-30 flex-col items-end gap-1">
            <span class="text-primary-900 text-xl font-black md:text-2xl">{{ percentage() }}%</span>
            <p-progressbar
              [value]="progressValue()"
              [showValue]="false"
              [pt]="{ root: { class: 'h-2 w-full' } }"
            />
          </div>
        }

        @if (actionLabel()) {
          <p-button
            [label]="actionLabel()!"
            size="small"
            class="whitespace-nowrap"
            (click)="actionClick.emit()"
            [pt]="{ root: { class: 'px-5 py-2 font-bold text-xs uppercase' } }"
          />
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressCardComponent {
  readonly title = input.required<string>();
  readonly specialty = input<string>();
  readonly topic = input<string>();
  readonly date = input.required<string>();
  readonly dateLabel = input<string | null>('ÚLTIMA ACTIVIDAD');
  readonly percentage = input<number | string>();
  readonly progress = input<number>();
  readonly actionLabel = input<string>();

  readonly progressValue = computed(() => this.progress() ?? Number(this.percentage() ?? 0));

  readonly actionClick = output<void>();
}
