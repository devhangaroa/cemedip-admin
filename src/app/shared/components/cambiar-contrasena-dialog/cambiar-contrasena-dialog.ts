import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

function contrasenasIgualesValidator(group: AbstractControl): ValidationErrors | null {
  const nueva = group.get('nueva_contrasena')?.value;
  const confirmar = group.get('confirmar_contrasena')?.value;
  return nueva === confirmar ? null : { noCoinciden: true };
}

@Component({
  selector: 'app-cambiar-contrasena-dialog',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './cambiar-contrasena-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CambiarContrasenaDialogComponent implements OnChanges {
  private fb = inject(NonNullableFormBuilder);

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() loading = false;
  @Output() confirmar = new EventEmitter<string>();

  protected readonly form = this.fb.group(
    {
      nueva_contrasena: ['', Validators.required],
      confirmar_contrasena: [''],
    },
    { validators: contrasenasIgualesValidator },
  );

  protected get noCoinciden(): boolean {
    return this.form.hasError('noCoinciden') && this.form.get('confirmar_contrasena')!.dirty;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible'] && !changes['visible'].currentValue) {
      this.form.reset();
    }
  }

  protected cerrar() {
    this.visibleChange.emit(false);
  }

  protected submit() {
    if (this.loading || this.form.invalid) return;
    this.confirmar.emit(this.form.getRawValue().nueva_contrasena);
  }
}
