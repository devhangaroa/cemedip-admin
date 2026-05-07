import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonFieldComponent } from '@shared/components/skeleton-field/skeleton-field';
import { CursosService } from '@core/services/cursos.service';
import { ToastService } from '@core/services/toast.service';
import { extractApiErrorMessage } from '@core/models/api.model';
import { CursoUpsertInput } from '@core/models/cursos.model';

@Component({
  selector: 'app-curso-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, DatePickerModule, InputTextModule, SelectModule, SkeletonFieldComponent],
  templateUrl: './curso-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursoFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cursosService = inject(CursosService);
  private toast = inject(ToastService);

  protected readonly activoOpciones = [
    { label: 'Sí', value: true },
    { label: 'No', value: false },
  ];

  protected readonly idCurso = signal<number | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly formSubmitted = signal(false);

  protected readonly esNuevo = computed(() => this.idCurso() === null);
  protected readonly backLink = computed(() => this.idCurso() ? ['/cursos', this.idCurso()] : ['/cursos']);
  protected readonly skeletonFields = Array.from({ length: 5 });

  protected readonly form = this.fb.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    fecha_inicio: [null as Date | null, Validators.required],
    fecha_fin: [null as Date | null, Validators.required],
    es_activo: [true],
  });

  protected ctrl(name: string) {
    return this.form.get(name)!;
  }

  protected fieldInvalid(name: string): boolean {
    const c = this.ctrl(name);
    return c.invalid && (c.touched || c.dirty || this.formSubmitted());
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.idCurso.set(+id);
      this.cargarCurso(+id);
    }
  }

  private cargarCurso(id: number) {
    this.isLoading.set(true);
    this.cursosService.getCurso(id).subscribe({
      next: (res) => {
        const c = res.data;
        this.form.patchValue({
          codigo: c.codigo,
          nombre: c.nombre,
          fecha_inicio: this.parseLocalDate(c.fecha_inicio),
          fecha_fin: this.parseLocalDate(c.fecha_fin),
          es_activo: c.es_activo,
        });
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isLoading.set(false);
      },
    });
  }

  guardar() {
    this.formSubmitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const raw = this.form.getRawValue();
    const payload: CursoUpsertInput = {
      codigo: raw.codigo,
      nombre: raw.nombre,
      fecha_inicio: this.formatDate(raw.fecha_inicio!),
      fecha_fin: this.formatDate(raw.fecha_fin!),
      es_activo: raw.es_activo,
    };

    const id = this.idCurso();
    const req = id
      ? this.cursosService.editarCurso(id, payload)
      : this.cursosService.crearCurso(payload);

    req.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (!id) {
          this.toast.success('Curso creado correctamente.');
          this.router.navigate(['/cursos', res.data.id_curso]);
        } else {
          this.toast.success('Cambios guardados correctamente.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err));
        this.isSaving.set(false);
      },
    });
  }

  private parseLocalDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
