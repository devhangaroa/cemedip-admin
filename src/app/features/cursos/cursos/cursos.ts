import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { CursosService } from '@core/services/cursos.service';
import { ToastService } from '@core/services/toast.service';
import { extractApiErrorMessage } from '@core/models/api.model';
import { Curso, CursosFiltros, EstadoCurso } from '@core/models/cursos.model';

@Component({
  selector: 'app-cursos',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, ConfirmDialogModule, DatePickerModule, InputTextModule, PaginatorModule, SelectModule],
  providers: [ConfirmationService],
  templateUrl: './cursos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CursosComponent {
  private fb = inject(NonNullableFormBuilder);
  private cursosService = inject(CursosService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected readonly estadoFiltroOpciones = [
    { label: 'Todos', value: null },
    { label: 'Sin Iniciar', value: 'sin_iniciar' },
    { label: 'En Curso', value: 'en_curso' },
    { label: 'Finalizado', value: 'finalizado' },
  ];

  protected readonly activoOpciones = [
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false },
    { label: 'Todos', value: null },
  ];

  protected readonly filtrosForm = this.fb.group({
    nombre: [''],
    fecha_inicio_desde: [null as Date | null],
    fecha_fin_hasta: [null as Date | null],
    estado: [null as EstadoCurso | null],
    es_activo: [true as boolean | null],
  });

  private readonly filtros = signal<CursosFiltros>({ page: 1, page_size: 10, es_activo: true });

  protected readonly cursosResource = rxResource({
    params: () => this.filtros(),
    stream: ({ params }) => this.cursosService.getCursos(params),
  });

  protected readonly cursos = computed(() => this.cursosResource.value()?.data ?? []);
  protected readonly paginador = computed(() => this.cursosResource.value()?.data_paginador ?? null);
  protected readonly isLoading = computed(() => this.cursosResource.isLoading());
  protected readonly totalRegistros = computed(() => this.paginador()?.total_registros ?? 0);
  protected readonly pageSize = signal(10);
  protected readonly paginaActual = computed(
    () => ((this.paginador()?.pagina_actual ?? 1) - 1) * this.pageSize(),
  );

  private readonly _ = effect(() => {
    const error = this.cursosResource.error() as HttpErrorResponse | null;
    if (error) this.toast.error(extractApiErrorMessage(error));
  });

  protected readonly estadoLabels: Record<string, string> = {
    sin_iniciar: 'Sin Iniciar',
    en_curso: 'En Curso',
    finalizado: 'Finalizado',
  };

  protected readonly estadoClasses: Record<string, string> = {
    sin_iniciar: 'bg-gray-100 text-gray-700',
    en_curso: 'bg-blue-100 text-blue-700',
    finalizado: 'bg-green-100 text-green-700',
  };

  buscar() {
    const { nombre, fecha_inicio_desde, fecha_fin_hasta, estado, es_activo } =
      this.filtrosForm.getRawValue();
    this.pageSize.set(10);
    this.filtros.set({
      page: 1,
      page_size: 10,
      nombre: nombre || undefined,
      fecha_inicio_desde: fecha_inicio_desde ? this.formatDate(fecha_inicio_desde) : undefined,
      fecha_fin_hasta: fecha_fin_hasta ? this.formatDate(fecha_fin_hasta) : undefined,
      estado: estado ?? undefined,
      es_activo: es_activo !== null ? es_activo : undefined,
    });
  }

  limpiar() {
    this.filtrosForm.reset({ es_activo: true });
    this.pageSize.set(10);
    this.filtros.set({ page: 1, page_size: 10, es_activo: true });
  }

  onPageChange(event: PaginatorState) {
    const page_size = event.rows ?? 10;
    const sizeChanged = page_size !== this.pageSize();
    const page = sizeChanged ? 1 : (event.page ?? 0) + 1;
    this.pageSize.set(page_size);
    this.filtros.update((f) => ({ ...f, page, page_size }));
  }

  verDetalle(id: number) {
    this.router.navigate(['/cursos', id]);
  }

  confirmarEliminar(curso: Curso) {
    this.confirmationService.confirm({
      message: `¿Desea eliminar el curso <strong>${curso.nombre}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.cursosService.eliminarCurso(curso.id_curso).subscribe({
          next: () => {
            this.toast.success(`Curso "${curso.nombre}" eliminado.`);
            this.cursosResource.reload();
          },
          error: (err: HttpErrorResponse) => this.toast.error(extractApiErrorMessage(err)),
        });
      },
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
