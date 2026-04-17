import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  template: `
    <div class="group flex w-full flex-col gap-3">
      @if (label()) {
        <label
          class="text-surface-700 group-focus-within:text-primary-500 ml-3 pl-1 text-xs font-bold tracking-widest uppercase transition-colors"
          [for]="inputId()"
        >
          {{ label() }}
        </label>
      }
      <div class="relative w-full">
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  inputId = input.required<string>();

  label = input<string>();
}
