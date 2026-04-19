import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { PaginatorState } from 'primeng/paginator';
import { SeguridadService } from '@core/services/seguridad.service';
import { EstudiantesFiltros } from '@core/models/seguridad.model';
import { extractApiErrorMessage } from '@core/models/api.model';

@Component({
  selector: 'app-estudiantes',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PaginatorModule],
  templateUrl: './estudiantes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstudiantesComponent {
  private fb = inject(NonNullableFormBuilder);
  private seguridadService = inject(SeguridadService);

  protected readonly filtrosForm = this.fb.group({
    nombres: [''],
    apellidos: [''],
    correo_institucional: [''],
  });

  private readonly filtros = signal<EstudiantesFiltros>({ page: 1, page_size: 10 });

  protected readonly estudiantesResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.seguridadService.getEstudiantes(params),
  });

  protected readonly estudiantes = computed(() => this.estudiantesResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.estudiantesResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.estudiantesResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly pageSize = signal(10);
  protected readonly paginaActual = computed(() => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize());

  protected readonly errorMessage = computed(() => {
    const error = this.estudiantesResource.error() as HttpErrorResponse | null;
    return error ? extractApiErrorMessage(error) : null;
  });

  buscar() {
    const { nombres, apellidos, correo_institucional } = this.filtrosForm.getRawValue();
    this.filtros.set({
      page: 1,
      page_size: 10,
      nombres: nombres || undefined,
      apellidos: apellidos || undefined,
      correo_institucional: correo_institucional || undefined,
    });
  }

  limpiar() {
    this.filtrosForm.reset();
    this.filtros.set({ page: 1, page_size: 10 });
  }

  onPageChange(event: PaginatorState) {
    const page_size = event.rows ?? 10;
    const sizeChanged = page_size !== this.pageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;
    this.pageSize.set(page_size);
    this.filtros.update((f) => ({ ...f, page, page_size }));
  }
}
